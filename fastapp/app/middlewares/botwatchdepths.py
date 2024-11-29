
import asyncio
from pprint import pprint
from time import sleep
from colorama import Fore, Style
from fastapi import FastAPI
from fastapp.app.utils.Binance.defines import TimeframeEventValue
from fastapp.app.utils import keepAlive
from fastapp.app.core.config import webSocketConnections
from fastapp.app.utils.BotWatchDepths import BotWatchDepths

async def on_remaining(data: TimeframeEventValue):
    # print('\033[93m', data.remaining, '\033[0m')
    await BotWatchDepths.webSocketConnections_send(webSocketConnections, {"status": "onRemaining", "data": data.to_json_object() })

async def on_close(data: TimeframeEventValue):
    # print('\033[92m--------on_close', data, '\033[0m')
    await BotWatchDepths.webSocketConnections_send(webSocketConnections, {"status": "onClose", "data": data.to_json_object() })

        
async def startBotWatchDepths(application: FastAPI= None):
    # pprint(vars(application))
    bot = BotWatchDepths()
    await bot.initExchanges()    
    await bot.multiActive(['BTCUSDT', 'WIFUSDT', 'SEIUSDT'])
    
    watchTask = await bot.watchs('1m', on_close, on_remaining, webSocketConnections)
    print(Fore.GREEN, "bot.watchs=", watchTask.get_name(), Style.RESET_ALL)
    await BotWatchDepths.webSocketConnections_send(webSocketConnections, {"status": "watchTask", "data": watchTask.get_name() })
    