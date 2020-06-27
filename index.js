const core = require('@actions/core');
const github = require('@actions/github');
const path = require('path');
const fs = require('fs');

try {
    console.log("Starting credentials scanner");
    const pathToSearch = core.getInput('pathToSearch');
    console.log(`Path to search=${pathToSearch}`);
    const fileTypes = core.getInput('fileTypes');
    console.log(`Fle types=${fileTypes}`);
    const payload = JSON.stringify(github.context.payload, undefined, 2);
    console.log(`Payload: ${payload}`);

    var found = findSecrets(pathToSearch, fileTypes);
    if(found && found.length > 0){
        core.setFailed('Found secrets in source files!');
        core.setOutput('foundSecrets', true);
    }else{
        console.log("No secrets found in the files");
        core.setOutput('foundSecrets', false);
    }
} catch (error) {
    core.setFailed(error.message);
}

function findSecrets(dir, fileExtension){
    let files = [];
    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.lstatSync(filePath);

        // If we hit a directory, apply our function to that dir. If we hit a file, check if it contains a secret
        if (stat.isDirectory()) {
            const filesWithSecrets = findSecrets(filePath, fileExtension);
            files.concat(filesWithSecrets);
        } else {
            if (path.extname(file) === fileExtension) {
                const fileContent = fs.readFileSync(filePath);
                const regex = new RegExp("(\"|')[a-z0-9\/+]{40}(\"|')", "ig");
                if (regex.test(fileContent)) {
                    console.log(`A secret was found in the file: ${filePath}`);
                    files.push(filePath);
                }
            }
        }
    });

    return files;
}