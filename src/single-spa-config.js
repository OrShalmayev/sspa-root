'use strict';

import * as singleSpa from 'single-spa';
import {isEmpty, get} from 'lodash';

//region constants
const APPLICATIONS = {
    APP:              {
        name:     'app',
        isActive: location => location.pathname.startsWith('/')
    },
    SETTINGS:         {
        name:     'settings',
        isActive: location => location.pathname.startsWith('/settings')
    },
    AUTHENTICATION: {
        name: 'authentication',
        isActive: location => location.pathname.startsWith('/authentication')
    }
};

const CORE_SERVICES = {
    name:     'coreServices',
    isActive: () => true
};

/*
cannot be defined as part of the "APPLICATIONS" array - because then the "default application" logic will break
 */
const HEADER_MFE = {
    name:     'header',
    isActive: () => true
};

/*
cannot be defined as part of the "APPLICATIONS" array - because then the "default application" logic will break
 */
const NAVBAR_MFE = {
    name:     'navbar',
    isActive: () => true
};

const coreServicesReadyPromise = new Promise(resolve => {
    window.addEventListener('core-services-ready',
        () => {
            resolve();
        },
        {once: true})
});

/*
maps each app name to its own instance of the "ace editor"
 */
const aceMap = {};
//endregion

//region exported functions
export function registerCoreServicesModule() {
    singleSpa.registerApplication(
        CORE_SERVICES.name,
        () => System.import(/* webpackIgnore: true */ CORE_SERVICES.name).then(mod => mod.default),
        CORE_SERVICES.isActive
    );
}

/**
 * registers all MFEs other than spot-client-core-services
 * the "loading function" for each MFE fetches its entry file and waits for spot-client-core-services to be ready
 */
export function registerMfes() {
    const appsArray = Object.values(APPLICATIONS);
    const mfes      = [...appsArray, HEADER_MFE, NAVBAR_MFE];

    for(let mfe of mfes) {
        const appLoadingFunction = () => {
            const appLoadPromise = System.import(/* webpackIgnore: true */ mfe.name);

            return Promise.all([appLoadPromise, coreServicesReadyPromise])
                .then(([appModule]) => appModule.default);
        };

        singleSpa.registerApplication(
            mfe.name,
            appLoadingFunction,
            mfe.isActive
        );
    }
}

//endregion

//region event listeners
/*
 * listen to single-spa's "before-routing-event" in order to define a default application in case non is active
 */
window.addEventListener('single-spa:before-routing-event', evt => {
    let activeApps = [];

    if(_.isEmpty(window.location.hash) === false) {
        let fixedPath = `${window.location.pathname}${window.location.hash.slice(1)}`;

        // remove duplicate "/" chars
        fixedPath       = fixedPath.replace(/\/+/g, '/');
        window.location = fixedPath;
    }

    for(let [key, value] of Object.entries(APPLICATIONS)) {
        if(value.isActive(window.location)) {
            activeApps.push(value.name);
        }
    }

    //set default application and support URL without any application prefix
    if(isEmpty(activeApps)) {
        evt.preventDefault();
        let url = `/spt${window.location.pathname}`;

        if(_.isEmpty(window.location.search) === false) {
            url = `${url}${window.location.search}`;
        }
        singleSpa.navigateToUrl(url);
    }
});

/*
 * listen to single-spa's "before-app-change" and run the mount/unmount hooks for non-infra apps
 */
window.addEventListener('single-spa:before-app-change', evt => {
    const appsToBeUnmounted = get(evt, 'detail.appsByNewStatus.NOT_MOUNTED') || [];
    const appsToBeMounted   = get(evt, 'detail.appsByNewStatus.MOUNTED') || [];

    const nonCoreAppsToBeMounted   = appsToBeMounted.filter(appName => isCoreApp(appName) === false);
    const nonCoreAppsToBeUnmounted = appsToBeUnmounted.filter(appName => isCoreApp(appName) === false);

    if(nonCoreAppsToBeUnmounted.length > 1) {
        console.warn('more than 1 non-infra app is about to be unmounted, (expected at most 1)');
    }

    if(nonCoreAppsToBeMounted.length > 1) {
        console.warn('more than 1 non-infra app is about to be mounted, (expected at most 1)');
    }

    beforeUnmountHook(nonCoreAppsToBeUnmounted[0]);

    beforeMountHook(nonCoreAppsToBeMounted[0]);
});
//endregion

//region internal functions
function isCoreApp(appName) {
    const retVal = [HEADER_MFE.name, NAVBAR_MFE.name, CORE_SERVICES.name].includes(appName);

    return retVal;
}

function beforeUnmountHook(appName) {
    // save the current global instance of ace in the map (under the current app name), and remove it from window
    if(appName != null && window.ace != null) {
        aceMap[appName] = window.ace;
        delete window.ace;
    }
}

function beforeMountHook(appName) {
    // add this app's own instance of ace (if exists) to the window
    if(appName != null && aceMap[appName] != null) {
        window.ace = aceMap[appName];
    }
}

//endregion