"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface GamePrediction {
  id: number
  homeTeam: {
    name: string
    ortg: number
    drtg: number
    pace: number
  }
  visitorTeam: {
    name: string
    ortg: number
    drtg: number
    pace: number
  }
  prediction: {
    homeMoneyline: number
    visitorMoneyline: number
    spread: number
    overUnder: number
  }
}

export default function NBASimulator() {
  const [isSimulating, setIsSimulating] = useState(false)
  const [predictions, setPredictions] = useState<GamePrediction[]>([])

  const runSimulation = () => {
    setIsSimulating(true)
    // Simulated data - in a real app, this would come from an API
    setTimeout(() => {
      setPredictions([
        {
          id: 1,
          homeTeam: {
            name: "Lakers",
            ortg: 114.2,
            drtg: 112.8,
            pace: 98.7,
          },
          visitorTeam: {
            name: "Celtics",
            ortg: 115.6,
            drtg: 111.2,
            pace: 97.9,
          },
          prediction: {
            homeMoneyline: -130,
            visitorMoneyline: +110,
            spread: -2.5,
            overUnder: 224.5,
          },
        },
        {
          id: 2,
          homeTeam: {
            name: "Warriors",
            ortg: 116.8,
            drtg: 113.5,
            pace: 99.2,
          },
          visitorTeam: {
            name: "Suns",
            ortg: 115.2,
            drtg: 112.9,
            pace: 98.4,
          },
          prediction: {
            homeMoneyline: -150,
            visitorMoneyline: +130,
            spread: -3.5,
            overUnder: 232.5,
          },
        },
      ])
      setIsSimulating(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-8">NBA Game Simulator</h1>
          <Button size="lg" onClick={runSimulation} disabled={isSimulating} className="bg-blue-600 hover:bg-blue-700">
            {isSimulating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Simulating...
              </>
            ) : (
              "Run Simulation"
            )}
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {predictions.map((game) => (
            <Card key={game.id} className="bg-gray-800 border-gray-700">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="text-xl font-semibold">{game.homeTeam.name}</div>
                  <div className="text-gray-400">vs</div>
                  <div className="text-xl font-semibold">{game.visitorTeam.name}</div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">ORTG</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-mono">{game.homeTeam.ortg}</div>
                      <div className="font-mono">{game.visitorTeam.ortg}</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">DRTG</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-mono">{game.homeTeam.drtg}</div>
                      <div className="font-mono">{game.visitorTeam.drtg}</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">PACE</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-mono">{game.homeTeam.pace}</div>
                      <div className="font-mono">{game.visitorTeam.pace}</div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-400 mb-1">Moneyline</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-mono text-green-400">
                          {game.prediction.homeMoneyline > 0 ? "+" : ""}
                          {game.prediction.homeMoneyline}
                        </div>
                        <div className="font-mono text-green-400">
                          {game.prediction.visitorMoneyline > 0 ? "+" : ""}
                          {game.prediction.visitorMoneyline}
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400 mb-1">Spread</div>
                      <div className="font-mono text-blue-400">
                        {game.prediction.spread > 0 ? "+" : ""}
                        {game.prediction.spread}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400 mb-1">O/U</div>
                      <div className="font-mono text-yellow-400">{game.prediction.overUnder}</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

