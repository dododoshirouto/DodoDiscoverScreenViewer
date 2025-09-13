import { discovers_to_json, get_config } from "./get_discovers.js";

const config = get_config();
console.log('config', config);

async function main() {
    await discovers_to_json(config);
}



a

await main();