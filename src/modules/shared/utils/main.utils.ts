import {env} from '../environment/environment';
export function generateRandomId(seed: number = 6) : string {
    const alphabets = "abcdefghijklmnopqrstuvwxyz";
    let id = "";
    let i = 0;
    while (i <= seed) {
        let rand = Math.floor(Math.random() * 26);
        if (rand%2 == 0) {
            id += alphabets[rand].toLocaleUpperCase()
        } else {
            id += alphabets[rand];
        }
        i++;
    }
    return id;
}


export function getApiCredentialsBase64(): string {

    let buff = Buffer.from(`${env.vtpass.sandbox.USERNAME}:${env.vtpass.sandbox.PASSWORD}`);

    return buff.toString('base64');
}

export function getNearlyFreeApiCredentialsBase64(): string {

    let buff = Buffer.from(`${env.nearlyfree.live.USERNAME}:${env.nearlyfree.live.APIKEY}`);

    return buff.toString('base64');
}

export function getBase64StringOf(input: string): string {

    let buff = Buffer.from(input);

    return buff.toString('base64');
}