const fs = require('fs');
const path = require('path');

const directory = './src'; // Change to your source directory

const addHeader = (dir) => {
  fs.readdir(dir, (err, files) => {
    if (err) throw err;

    files.forEach((file) => {
      const filePath = path.join(dir, file);

      fs.stat(filePath, (err, stat) => {
        if (err) throw err;

        if (stat.isDirectory()) {
          addHeader(filePath); // Recursively handle directories
        } else if (file.endsWith('.js') || file.endsWith('.ts')) {
          fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) throw err;

            // Check if BASE_URL and BASE_URLIO are already imported
            const hasBaseUrl = data.includes('import { BASE_URL } from \'@env\'');
            const hasBaseUrlIO = data.includes('import { BASE_URLIO } from \'@env\'');

            let newContent = data;

            // Add the necessary imports if they are missing
            if (!hasBaseUrl && !hasBaseUrlIO) {
              const header = "import { BASE_URL, BASE_URLIO } from '@env';\n\n";
              newContent = header + data;
            } else if (!hasBaseUrl) {
              const header = "import { BASE_URL } from '@env';\n\n";
              newContent = header + data;
            } else if (!hasBaseUrlIO) {
              const header = "import { BASE_URLIO } from '@env';\n\n";
              newContent = header + data;
            }

            // Write the updated content back to the file
            if (newContent !== data) {
              fs.writeFile(filePath, newContent, (err) => {
                if (err) throw err;
                console.log(`Header added to ${filePath}`);
              });
            }
          });
        }
      });
    });
  });
};

addHeader(directory);
