import { argv, env } from "node:process"
import { spawn } from "node:child_process"

// Set your custom env variables here
const extenv = {
    NODE_ENV: argv[2],
}

console.log(argv[2])

spawn(argv[3], argv.slice(4), {
  env: {
    ...env,
    ...extenv
  },
  stdio: 'inherit'
})
