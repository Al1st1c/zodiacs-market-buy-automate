const axios = require('axios')
const fs = require('fs')
const colors = require('colors')

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// LETS GO MARKET
let config = fs.readFileSync(`./config2.txt`, 'utf-8').toString();
config = JSON.parse(config.split('=')[1])


async function consultarMercado(valor){
    try {
        const body = {
            page: 1,
            itemType: "car",
            filterMine: false,
            carTypeId: null,
            starRange: [1,6],
            sortBy: "price-asc",
            ...config
          }
        const consultaMercado = await axios.post('https://8za04rmw3eb0.grandmoralis.com:2053/server/functions/marketplace_getItemsOnSale', body)

        for(const itera of consultaMercado.data.result.results){
            console.log(`[ 💰 ] - Preço do carro:`.green + `${itera.selling.price} ZDC`.magenta)
            if(itera.selling.price <= valor){
                await comprarCar(itera.userId, itera.selling.nonce)
            }else{
                continue;
            }
        }
        //refaz o fluxo
        console.log('[ 🔄 ] Atualizando Mercado..'.yellow)
        await sleep(3000)
        return consultarMercado(valor);
    } catch (error) {
        // console.log(error?.response?.data)
        console.log('[ 🔴 ] Problema de servidor do zodiacs, reentrando no site...'.red)
        if(error?.response?.status === 502){
            return consultarMercado(valor)
        }

        return { error: 2 }
    }
}


async function comprarCar(userId, nonce){
    try {
        const body = {...config, nonce, userCarId: userId}
        const compra = await axios.post('https://8za04rmw3eb0.grandmoralis.com:2053/server/functions/marketplace_buyCar', body)
        console.log(compra.data)
    } catch (error) {
        if(error?.response?.status === 502){
            return comprarCar(userId, nonce)
        }
        console.log(error?.response?.data)

        return { error: 2 }
    }
}


async function start(){
    try {
        const consultaecompra = await consultarMercado(500);
        if(consultaecompra?.error == 2){
            return await start();
        }
    } catch (error) {
        console.log(error)
    }
}


start();