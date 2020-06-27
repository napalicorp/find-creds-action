const core = require('@actions/core');
const github = require('@actions/github');
const findInFiles = require('find-in-files');

try {
    console.log("Starting credentials scanner");
    const pathToSearch = core.getInput('path');
    console.log(`Path to search={pathToSearch}`);
    const fileTypes = core.getInput('fileTypes');
    console.log(`Fle types={fileTypes}`);
    const payload = JSON.stringify(github.context.payload, undefined, 2);
    console.log(`Payload: {payload}`);

    findInFiles.find({'term': "[a-z0-9\/+]{40}", 'flags': 'ig'}, '.', '.js$')
    .then(function(results) {
        for (var result in results) {
            var res = results[result];
            console.log(
                'found "' + res.matches[0] + '" ' + res.count
                + ' times in "' + result + '"'
            );
        }

        if(result.length > 0){
            core.setFailed('Found secrets in source files!');
            core.setOutput('foundSecrets', true);
        }else{
            console.log("No secrets found in the files");
            core.setOutput('foundSecrets', false);
        }
    });
} catch (error) {
    core.setFailed(error.message);
}

