'use strict';

import "core-js/stable";
import "regenerator-runtime/runtime";
import './vendor';
import './index.scss';
import * as singleSpa from 'single-spa';
import {registerMfes, registerCoreServicesModule} from './single-spa-config'
import {MODULE_DUMMY_PREFIX, addImportMap, addImportMapOverridesSupport} from './import-map-initiator';

function initSharedLibs() {
    System.set(`${MODULE_DUMMY_PREFIX}:moment`, require('moment'));
}

async function bootstrap() {
    await addImportMap();
    await addImportMapOverridesSupport();
    initSharedLibs();
    registerCoreServicesModule();
    registerMfes();
    singleSpa.start();
    window.singleSpa = singleSpa;
}

bootstrap();

