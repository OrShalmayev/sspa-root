# SSPA-ROOT
A wrapper application for our console micro services that contains the SingleSPA framework.
this application can be used to define the micro applications and the shared libraries.

## Build & Run
While working locally, the `import-map` is by default being taken from dev environment and suits dev applications.
using import-map-overrides package, it is possible to override the import-map entries to take local (or any other location) bundles.
 * run `npm run build:dev` command in order to build the root application using webpack and 
 watch for changes (enable incremental builds)
 * in order to serve the local files of the sspa-root and the rest of the applications, choose one of the following:
    * run the console backend as described in the console backend README to serve the root build output files. note that 
  this requires having all the micro frontends bundles locally
    * run the npm `serve` job - this job serves the root's application local files and redirects other requests to in dev env.
  note that in this mode only requests that start with `/root` are not forwarded to dev env  

## Add New Micro App
Adding a new micro application consists of several steps:
1. For Angular projects, start a new repository from [sspa-template]() 
2. The new application is responsible to add and remove it's styles and resources on mount/unmount (see [bootstrapSPA.js]() for example)
3. The application should be first supported by [sspa-backend]() (checkout the repo README file for more details)
4. Updating the `import-map.json` - the import-map file is taken from CloudFront. when adding a new application, all places should be modified to recognize the new application
    *  add an entry for the new application with its name as the key and its endpoint as the value. note that the value must be the application's entry point
5. In `sspa-root` repo, follow these steps:  
    * In [single-spa-config.js](https://github.com/spotinst/spotinst-client-root/blob/master/src/single-spa-config.js) file, add the new application to the `APPLICATIONS` constant

**note that the child application should be bundled as `System.js` module**

## Add Shared Library
Shared libraries are used when we have multiple micro applications that use the same libraries and we don't want to include them in 
the bundle of each application. in order to add a shared library follow these steps:
1. Install the package in this application using `npm`
2. Add the package name (as it used in import/require statements) to `MODULES_TO_EXPORT` constant in `import-map-initiator.js` file. 
this will make the package available using `System.js` by adding it to the import map with dummy url
3. Replace the dummy url in the import map with the module from `node_modules`. 
to do that, add the following command: 
`System.set('${MODULE_DUMMY_PREFIX}:$PACKAGE_NAME', require('$PACKAGE_NAME'));` to
`initSharedLibs` function in `app.js` file
4. After making the module available with `System.js`, we need to exclude it from the child applications build.
do that by adding the module to `externals` in the webpack config  
