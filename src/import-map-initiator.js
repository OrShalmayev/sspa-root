'use strict';

export const MODULES_TO_EXPORT = [
];

export const MODULE_DUMMY_PREFIX = 'app';

/*
since shared modules should be registered to Systemjs in order to be available in all child applications, we need to include
them in the import map (references in index.html)
 */
export function enrichImportMap(importMap) {
    let modulesObject = {};

    MODULES_TO_EXPORT.forEach(mod => {
        modulesObject[mod] = `${MODULE_DUMMY_PREFIX}:${mod}`;
    });

    importMap.imports = Object.assign(importMap.imports, modulesObject);

    return importMap;
}

export async function addImportMap() {
    const scriptElement = document.createElement('script');
    const baseUrl       = window.location.origin;

    const imResponse  = await fetch(`${baseUrl}/import-map.json`);
    let baseImportMap = await imResponse.json();

    const enrichedImportMap   = enrichImportMap(baseImportMap);
    scriptElement.type        = 'systemjs-importmap';
    scriptElement.textContent = JSON.stringify(enrichedImportMap);
    document.head.append(scriptElement);
}

export async function addImportMapOverridesSupport() {
    await import(/* webpackChunkName: "importMapOverrides" */ 'import-map-overrides');

    if(process.env.NODE_ENV !== 'production') {
        importMapOverrides.enableUI();
    }
}
