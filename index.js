const { execSync } = require('child_process');

function error(msg) {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
}

let waitHealthcheck = false;
let timeout = 0;
let scriptName = 'docker-healthcheck';

const args = [];
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];

  if (arg[0] === '-') {
    if (arg === '--wait-healthcheck') {
      waitHealthcheck = true;
    } else if (arg === '-timeout') {
      i++;
      if (process.argv[i] === undefined) {
        error('Unspecified timeout seconds');
      }

      timeout = parseInt(process.argv[i], 10);
    } else if (arg === '-script') {
      i++;
      if (process.argv[i] === undefined) {
        error('Unspecified healthcheck script file');
      }

      scriptName = process.argv[i];
    } else {
      error(`Unexpected argument "${arg}"`);
    }
  } else {
    args.push(arg);
  }
}

if (args.length > 2) {
  error(`Too many arguments (expected 2, got ${args.length})`);
} else if (args.length === 0) {
  error('Image name not specified as an argument');
} else if (args.length === 1) {
  error('Network name not specified as an argument');
}

const network = args[0];
const name = args[1];
const image = `${network}_${name}`;

let container;
let pollInterval;

const checkTimeout = (success) => {
  if (success) {
    clearInterval(pollInterval);
  } else if (timeout && process.uptime() >= timeout) {
    clearInterval(pollInterval);
    error('Timeout reached');
  }
};

pollInterval = setInterval(() => {
  container = execSync(`docker ps -qf "name=${image}"`).toString();
  const validContainer = (container !== '');
  checkTimeout(validContainer);

  if (validContainer) {
    pollInterval = setInterval(() => {
      let success = false;

      if (waitHealthcheck) {
        const status = execSync(`docker inspect --format='{{.State.Health.Status}}' ${container}`).toString()
          .trim()
          .replace(/'/g, '');

        success = status === 'healthy';
      } else {
        try {
          execSync(`docker-compose -p ${network} exec -T ${name} ${scriptName}`);
          success = true;
        } catch (e) {
          // Healthcheck failed
        }
      }

      checkTimeout(success);
    }, 0);
  }
}, 0);
