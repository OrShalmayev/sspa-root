'use strict';

const fs       = require('fs');
const chokidar = require('chokidar');

const PUBLIC_PATH  = '/root';
const PORT         = 5100;
let buildFileNames = fs.readdirSync('build');

chokidar.watch('build', {
    awaitWriteFinish: true
}).on('change', path => {
    console.log(`Build content has been changed, updating the files names`);
    buildFileNames = fs.readdirSync('build');
});

module.exports = {
    devServer: {
        static:             {
            directory:  'build',
            publicPath: `${PUBLIC_PATH}/`,
            watch:      true
        },
        compress:           true,
        open: '/root/index.html',
        historyApiFallback: {
            rewrites: [
                { from: /./, to: '/root/index.html' },
            ]
        },
        port:               PORT,
        proxy:              [
            {
                context:      function(pathname) {
                    return pathname.startsWith(PUBLIC_PATH) === false;
                },
                target:       'server_url',
                secure:       false,
                changeOrigin: true
            }
        ]
    }
};
