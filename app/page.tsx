"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import type React from "react"

// Simplified Trading Types
export type OrderSide = "buy" | "sell"
export type OrderType = "market" | "limit" | "stop" | "stop_limit"

export interface Instrument {
  symbol: string
  name: string
  price: string
  change: string
  changeValue: string
  bid: number
  ask: number
  mid: number
}

export interface Position {
  symbol: string
  side: "long" | "short"
  qty: number
  avgEntry: number
  markPrice: number
  unrealizedPnL: number
}

// Sample data
const sampleInstruments: Instrument[] = [
  {
    symbol: "FX:EURUSD",
    name: "EURUSD",
    price: "1.15874",
    change: "+0.19%",
    changeValue: "+0.00222",
    bid: 1.15854,
    ask: 1.15894,
    mid: 1.15874,
  },
  {
    symbol: "FX:EURJPY",
    name: "EURJPY",
    price: "171.526",
    change: "-0.05%",
    changeValue: "-0.090",
    bid: 171.516,
    ask: 171.536,
    mid: 171.526,
  },
  {
    symbol: "FX:GBPUSD",
    name: "GBPUSD",
    price: "1.34397",
    change: "+0.18%",
    changeValue: "+0.00237",
    bid: 1.34377,
    ask: 1.34417,
    mid: 1.34397,
  },
  {
    symbol: "FX:GBPJPY",
    name: "GBPJPY",
    price: "198.869",
    change: "+0.09%",
    changeValue: "+0.178",
    bid: 198.859,
    ask: 198.879,
    mid: 198.869,
  },
  {
    symbol: "FX:USDJPY",
    name: "USD/JPY",
    price: "148.007",
    change: "-0.22%",
    changeValue: "-0.330",
    bid: 147.997,
    ask: 148.017,
    mid: 148.007,
  },
  {
    symbol: "FX:EURCHF",
    name: "EURCHF",
    price: "0.93468",
    change: "-0.06%",
    changeValue: "-0.00056",
    bid: 0.93458,
    ask: 0.93478,
    mid: 0.93468,
  },
  {
    symbol: "FX:EURGBP",
    name: "EURGBP",
    price: "0.86248",
    change: "-0.14%",
    changeValue: "-0.00121",
    bid: 0.86238,
    ask: 0.86258,
    mid: 0.86248,
  },
  {
    symbol: "XAUUSD",
    name: "XAUUSD",
    price: "3376.13",
    change: "-0.51%",
    changeValue: "-17.24",
    bid: 3375.13,
    ask: 3377.13,
    mid: 3376.13,
  },
]

const samplePositions: Position[] = [
  {
    symbol: "FX:EURUSD",
    side: "long",
    qty: 10000,
    avgEntry: 1.105,
    markPrice: 1.15856,
    unrealizedPnL: 535.6,
  },
  {
    symbol: "FX:GBPUSD",
    side: "short",
    qty: 5000,
    avgEntry: 1.25,
    markPrice: 1.34366,
    unrealizedPnL: 468.3,
  },
]

const generateRandomPriceData = (basePrice: number) => {
  const bid = basePrice - Math.random() * 0.0005
  const ask = basePrice + Math.random() * 0.0005
  const change = (Math.random() - 0.5) * 0.01
  const changePercent = (change / basePrice) * 100

  return {
    bid: bid.toFixed(5),
    ask: ask.toFixed(5),
    spread: ((ask - bid) * 10000).toFixed(1),
    net: change.toFixed(6),
    changePercent: changePercent.toFixed(2),
    lastUpdate: "11:15:33",
  }
}

const WatchlistTable: React.FC<{
  instruments: Instrument[]
  onBidClick: (symbol: string) => void
  onAskClick: (symbol: string) => void
}> = ({ instruments, onBidClick, onAskClick }) => {
  const getCountryCode = (symbol: string) => {
    const codes: { [key: string]: string } = {
      "FX:EURUSD": "EU",
      "FX:EURJPY": "EU",
      "FX:GBPUSD": "GB",
      "FX:GBPJPY": "GB",
      "FX:USDJPY": "US",
      "FX:EURCHF": "EU",
      "FX:EURGBP": "EU",
      XAUUSD: "XAU",
    }
    return codes[symbol] || "FX"
  }

  return (
    <div className="overflow-auto scrollbar-hide">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-black">
          <tr className="text-slate-400 border-b border-slate-700">
            <th className="text-left py-2 px-2">Instrument</th>
            <th className="text-center py-2 px-2">Bid</th>
            <th className="text-center py-2 px-2">Ask</th>
            <th className="text-center py-2 px-2">Spread</th>
            <th className="text-center py-2 px-2">Net</th>
            <th className="text-center py-2 px-2">% 1D</th>
            <th className="text-center py-2 px-2">Price update</th>
          </tr>
        </thead>
        <tbody>
          {instruments.map((instrument) => {
            const priceData = generateRandomPriceData(instrument.mid)
            const isPositive = Number.parseFloat(priceData.changePercent) >= 0

            return (
              <tr key={instrument.symbol} className="border-b border-slate-800 hover:bg-slate-800/50">
                <td className="py-2 px-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400 font-mono">{getCountryCode(instrument.symbol)}</span>
                    <span className="text-white font-medium">{instrument.name}</span>
                  </div>
                </td>
                <td className="py-2 px-2 text-center">
                  <button
                    onClick={() => onBidClick(instrument.symbol)}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                  >
                    {priceData.bid}
                  </button>
                </td>
                <td className="py-2 px-2 text-center">
                  <button
                    onClick={() => onAskClick(instrument.symbol)}
                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                  >
                    {priceData.ask}
                  </button>
                </td>
                <td className="py-2 px-2 text-center text-white">{priceData.spread}</td>
                <td className={`py-2 px-2 text-center font-medium ${isPositive ? "text-green-400" : "text-red-400"}`}>
                  {priceData.net}
                </td>
                <td className={`py-2 px-2 text-center font-medium ${isPositive ? "text-green-400" : "text-red-400"}`}>
                  {isPositive ? "+" : ""}
                  {priceData.changePercent}%
                </td>
                <td className="py-2 px-2 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-slate-300">{priceData.lastUpdate}</span>
                    <span className="text-green-400 text-xs">●</span>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

const TradingInstrumentCard: React.FC<{
  instrument: Instrument
  onQuickTrade: (symbol: string, side: OrderSide, quantity: number) => void
}> = ({ instrument, onQuickTrade }) => {
  const [quantity, setQuantity] = useState(0.5)
  const [tolerance, setTolerance] = useState(0)

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(0.1, quantity + delta))
  }

  const handleToleranceChange = (delta: number) => {
    setTolerance(Math.max(0, tolerance + delta))
  }

  const getCountryCode = (symbol: string) => {
    const codes: { [key: string]: string } = {
      "FX:EURUSD": "EU",
      "FX:GBPUSD": "GB",
      "FX:USDJPY": "US",
      "FX:USDCHF": "US",
      "FX:AUDUSD": "AU",
      "FX:USDCAD": "US",
    }
    return codes[symbol] || "FX"
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-2 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <span className="text-xs text-slate-400 font-mono">{getCountryCode(instrument.symbol)}</span>
          <span className="text-white font-medium text-xs">{instrument.name}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-blue-400 text-xs">●</span>
          <button className="text-slate-400 hover:text-white text-xs">⋯</button>
        </div>
      </div>

      {/* Quantity */}
      <div className="flex items-center justify-between">
        <span className="text-slate-300 text-xs font-medium">Quantity</span>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleQuantityChange(-0.1)}
            className="w-5 h-5 bg-slate-700 hover:bg-slate-600 text-white rounded flex items-center justify-center text-xs font-bold"
          >
            −
          </button>
          <span className="text-white font-bold text-sm min-w-[2.5rem] text-center">{quantity.toFixed(1)}</span>
          <button
            onClick={() => handleQuantityChange(0.1)}
            className="w-5 h-5 bg-slate-700 hover:bg-slate-600 text-white rounded flex items-center justify-center text-xs font-bold"
          >
            +
          </button>
        </div>
      </div>

      {/* Buy/Sell Buttons */}
      <div className="grid grid-cols-2 gap-1">
        <button
          onClick={() => onQuickTrade(instrument.symbol, "sell", quantity)}
          className="bg-red-600 hover:bg-red-700 text-white py-2 px-1 rounded font-bold text-center transition-colors"
        >
          <div className="text-xs font-medium mb-0.5">SELL</div>
          <div className="text-sm font-bold">{instrument.bid.toFixed(5)}</div>
        </button>
        <button
          onClick={() => onQuickTrade(instrument.symbol, "buy", quantity)}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-1 rounded font-bold text-center transition-colors"
        >
          <div className="text-xs font-medium mb-0.5">BUY</div>
          <div className="text-sm font-bold">{instrument.ask.toFixed(5)}</div>
        </button>
      </div>

      {/* MKT Order indicators */}
      <div className="grid grid-cols-2 gap-1 text-xs">
        <div className="text-center">
          <span className="bg-slate-700 text-white px-1 py-0.5 rounded text-xs">MKT order</span>
          <span className="ml-1 text-red-400 font-bold text-xs">1.8</span>
        </div>
        <div className="text-center">
          <span className="bg-slate-700 text-white px-1 py-0.5 rounded text-xs">MKT order</span>
          <span className="ml-1 text-blue-400 font-bold text-xs">0.7</span>
        </div>
      </div>

      {/* Tolerance */}
      <div className="flex items-center justify-between">
        <span className="text-slate-300 text-xs font-medium">Tolerance</span>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleToleranceChange(-0.1)}
            className="w-5 h-5 bg-slate-700 hover:bg-slate-600 text-white rounded flex items-center justify-center text-xs font-bold"
          >
            −
          </button>
          <span className="text-white font-medium text-xs min-w-[1.5rem] text-center">
            {tolerance === 0 ? "Off" : tolerance.toFixed(1)}
          </span>
          <button
            onClick={() => handleToleranceChange(0.1)}
            className="w-5 h-5 bg-slate-700 hover:bg-slate-600 text-white rounded flex items-center justify-center text-xs font-bold"
          >
            +
          </button>
        </div>
      </div>

      {/* Net Position and P/L */}
      <div className="space-y-0.5 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-400">Net pos</span>
          <span className="text-white">−</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">P/L</span>
          <span className="text-white">−</span>
        </div>
      </div>
    </div>
  )
}

const ProductOverview = ({ selectedInstrument }: { selectedInstrument: string }) => {
  const symbolInfoRef = useRef<HTMLDivElement>(null)
  const miniChartRef = useRef<HTMLDivElement>(null)
  const technicalAnalysisRef = useRef<HTMLDivElement>(null)
  const companyProfileRef = useRef<HTMLDivElement>(null)
  const fundamentalDataRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!selectedInstrument) return

    const loadWidgets = () => {
      // Symbol Info Widget
      if (symbolInfoRef.current) {
        symbolInfoRef.current.innerHTML = `
          <div class="tradingview-widget-container" style="height:200px;width:100%">
            <div class="tradingview-widget-container__widget"></div>
            <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js" async>
            {
              "symbol": "${selectedInstrument}",
              "width": "100%",
              "locale": "en",
              "colorTheme": "dark",
              "isTransparent": false
            }
            </script>
          </div>
        `
      }

      // Mini Chart Widget
      if (miniChartRef.current) {
        miniChartRef.current.innerHTML = `
          <div class="tradingview-widget-container" style="height:220px;width:100%">
            <div class="tradingview-widget-container__widget"></div>
            <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js" async>
            {
              "symbol": "${selectedInstrument}",
              "width": "100%",
              "height": "220",
              "locale": "en",
              "dateRange": "12M",
              "colorTheme": "dark",
              "isTransparent": false,
              "autosize": false,
              "largeChartUrl": ""
            }
            </script>
          </div>
        `
      }

      // Technical Analysis Widget
      if (technicalAnalysisRef.current) {
        technicalAnalysisRef.current.innerHTML = `
          <div class="tradingview-widget-container" style="height:425px;width:100%">
            <div class="tradingview-widget-container__widget"></div>
            <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js" async>
            {
              "interval": "1m",
              "width": "100%",
              "isTransparent": false,
              "height": "425",
              "symbol": "${selectedInstrument}",
              "showIntervalTabs": true,
              "locale": "en",
              "colorTheme": "dark"
            }
            </script>
          </div>
        `
      }

      // Company Profile Widget
      if (companyProfileRef.current) {
        companyProfileRef.current.innerHTML = `
          <div class="tradingview-widget-container" style="height:400px;width:100%">
            <div class="tradingview-widget-container__widget"></div>
            <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js" async>
            {
              "width": "100%",
              "height": "400",
              "isTransparent": false,
              "colorTheme": "dark",
              "symbol": "${selectedInstrument}",
              "locale": "en"
            }
            </script>
          </div>
        `
      }

      // Fundamental Data Widget
      if (fundamentalDataRef.current) {
        fundamentalDataRef.current.innerHTML = `
          <div class="tradingview-widget-container" style="height:400px;width:100%">
            <div class="tradingview-widget-container__widget"></div>
            <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-financials.js" async>
            {
              "isTransparent": false,
              "largeChartUrl": "",
              "displayMode": "regular",
              "width": "100%",
              "height": "400",
              "colorTheme": "dark",
              "symbol": "${selectedInstrument}",
              "locale": "en"
            }
            </script>
          </div>
        `
      }
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(loadWidgets, 100)
    return () => clearTimeout(timer)
  }, [selectedInstrument])

  return (
    <div className="h-full overflow-y-auto scrollbar-hide p-4 space-y-4">
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-white font-medium mb-4">Symbol Information</h3>
        <div ref={symbolInfoRef} className="w-full" />
      </div>

      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-white font-medium mb-4">Mini Chart</h3>
        <div ref={miniChartRef} className="w-full" />
      </div>

      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-white font-medium mb-4">Technical Analysis</h3>
        <div ref={technicalAnalysisRef} className="w-full" />
      </div>

      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-white font-medium mb-4">Company Profile</h3>
        <div ref={companyProfileRef} className="w-full" />
      </div>

      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-white font-medium mb-4">Fundamental Data</h3>
        <div ref={fundamentalDataRef} className="w-full" />
      </div>
    </div>
  )
}

const TradingViewChart = () => {
  const chartRef = useRef<HTMLDivElement>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!chartRef.current || initialized) return

    console.log("[v0] Loading TradingView chart for symbol:", chartRef.current.id)

    // Clear existing widget
    chartRef.current.innerHTML = ""

    // Load TradingView script if not already loaded
    if (!window.TradingView) {
      const script = document.createElement("script")
      script.src = "https://s3.tradingview.com/tv.js"
      script.async = true
      script.onload = () => {
        console.log("[v0] TradingView chart script loaded successfully")
        initializeWidget()
      }
      document.head.appendChild(script)
    } else {
      initializeWidget()
    }

    function initializeWidget() {
      if (window.TradingView && chartRef.current) {
        new window.TradingView.widget({
          autosize: true,
          symbol: "FX:EURUSD",
          interval: "1D",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#1e293b",
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          container_id: chartRef.current.id,
          studies: ["Volume@tv-basicstudies"],
          overrides: {
            "paneProperties.background": "#0f172a",
            "paneProperties.vertGridProperties.color": "#334155",
            "paneProperties.horzGridProperties.color": "#334155",
            "symbolWatermarkProperties.transparency": 90,
            "scalesProperties.textColor": "#94a3b8",
            "mainSeriesProperties.candleStyle.wickUpColor": "#22c55e",
            "mainSeriesProperties.candleStyle.wickDownColor": "#ef4444",
            "mainSeriesProperties.candleStyle.upColor": "#22c55e",
            "mainSeriesProperties.candleStyle.downColor": "#ef4444",
            "mainSeriesProperties.candleStyle.borderUpColor": "#22c55e",
            "mainSeriesProperties.candleStyle.borderDownColor": "#ef4444",
          },
        })
        setInitialized(true)
      }
    }
  }, []) // Empty dependency array to prevent infinite loop

  return (
    <div className="h-full w-full overflow-hidden">
      <div ref={chartRef} id="tradingview_chart" className="h-full w-full" />
    </div>
  )
}

const DepthOfMarket = ({ selectedInstrument }: { selectedInstrument: string }) => {
  const [orderBookData, setOrderBookData] = useState<{
    bids: Array<{ price: number; size: number; total: number }>
    asks: Array<{ price: number; size: number; total: number }>
  }>({
    bids: [],
    asks: [],
  })

  useEffect(() => {
    // Generate sample order book data
    const generateOrderBook = () => {
      const basePrice = 1.15874 // Base price for EURUSD
      const bids = []
      const asks = []
      let bidTotal = 0
      let askTotal = 0

      // Generate bid levels (below market price)
      for (let i = 0; i < 10; i++) {
        const price = basePrice - (i + 1) * 0.00001
        const size = Math.floor(Math.random() * 1000000) + 100000
        bidTotal += size
        bids.push({ price, size, total: bidTotal })
      }

      // Generate ask levels (above market price)
      for (let i = 0; i < 10; i++) {
        const price = basePrice + (i + 1) * 0.00001
        const size = Math.floor(Math.random() * 1000000) + 100000
        askTotal += size
        asks.push({ price, size, total: askTotal })
      }

      setOrderBookData({ bids, asks })
    }

    generateOrderBook()
    const interval = setInterval(generateOrderBook, 2000) // Update every 2 seconds

    return () => clearInterval(interval)
  }, [selectedInstrument])

  const maxTotal = Math.max(
    Math.max(...orderBookData.bids.map((b) => b.total)),
    Math.max(...orderBookData.asks.map((a) => a.total)),
  )

  return (
    <div className="h-full overflow-y-auto scrollbar-hide p-4">
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-white font-medium mb-4">Order Book - {selectedInstrument}</h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Asks (Sell Orders) */}
          <div>
            <div className="text-red-400 font-medium mb-2 text-sm">Asks (Sell)</div>
            <div className="space-y-1">
              {orderBookData.asks
                .slice()
                .reverse()
                .map((ask, index) => (
                  <div key={index} className="relative flex justify-between items-center text-xs py-1 px-2 rounded">
                    <div
                      className="absolute inset-0 bg-red-900/20 rounded"
                      style={{ width: `${(ask.total / maxTotal) * 100}%` }}
                    />
                    <span className="text-red-400 font-mono relative z-10">{ask.price.toFixed(5)}</span>
                    <span className="text-white relative z-10">{ask.size.toLocaleString()}</span>
                    <span className="text-slate-400 relative z-10">{ask.total.toLocaleString()}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Bids (Buy Orders) */}
          <div>
            <div className="text-green-400 font-medium mb-2 text-sm">Bids (Buy)</div>
            <div className="space-y-1">
              {orderBookData.bids.map((bid, index) => (
                <div key={index} className="relative flex justify-between items-center text-xs py-1 px-2 rounded">
                  <div
                    className="absolute inset-0 bg-green-900/20 rounded"
                    style={{ width: `${(bid.total / maxTotal) * 100}%` }}
                  />
                  <span className="text-green-400 font-mono relative z-10">{bid.price.toFixed(5)}</span>
                  <span className="text-white relative z-10">{bid.size.toLocaleString()}</span>
                  <span className="text-slate-400 relative z-10">{bid.total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Market Spread */}
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Spread:</span>
            <span className="text-white font-mono">
              {orderBookData.asks.length > 0 && orderBookData.bids.length > 0
                ? (orderBookData.asks[0].price - orderBookData.bids[0].price).toFixed(5)
                : "0.00000"}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-slate-400">Mid Price:</span>
            <span className="text-white font-mono">
              {orderBookData.asks.length > 0 && orderBookData.bids.length > 0
                ? ((orderBookData.asks[0].price + orderBookData.bids[0].price) / 2).toFixed(5)
                : "0.00000"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TradingPlatform() {
  const [selectedInstrument, setSelectedInstrument] = useState("FX:EURUSD")
  const [leftPanelWidth, setLeftPanelWidth] = useState(400)
  const [positionsHeight, setPositionsHeight] = useState(220)
  const [activeTab, setActiveTab] = useState("Watchlists")
  const [rightActiveTab, setRightActiveTab] = useState("Charts")
  const [oneClickTradingEnabled, setOneClickTradingEnabled] = useState(false)
  const [showTradeModal, setShowTradeModal] = useState(false)
  const [isDraggingHorizontal, setIsDraggingHorizontal] = useState(false)
  const [isDraggingVertical, setIsDraggingVertical] = useState(false)

  const [windowsSwapped, setWindowsSwapped] = useState(false)
  const [depthOfMarketDetached, setDepthOfMarketDetached] = useState(false)
  const [depthOfMarketPosition, setDepthOfMarketPosition] = useState({ x: 100, y: 100 })
  const [isDraggingWindow, setIsDraggingWindow] = useState(false)
  const [isDraggingTab, setIsDraggingTab] = useState(false)

  const handleWindowSwap = useCallback(() => {
    setWindowsSwapped(!windowsSwapped)
  }, [windowsSwapped])

  const handleDetachDepthOfMarket = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDraggingTab(true)

    const handleMouseMove = (e: MouseEvent) => {
      const rect = document.body.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // If dragged far enough from original position, detach
      if (Math.abs(x - e.clientX) > 50 || Math.abs(y - e.clientY) > 50) {
        setDepthOfMarketDetached(true)
        setDepthOfMarketPosition({ x: e.clientX - 200, y: e.clientY - 50 })
        setRightActiveTab("Charts") // Switch back to Charts tab
      }
    }

    const handleMouseUp = () => {
      setIsDraggingTab(false)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }, [])

  const handleDetachedWindowMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsDraggingWindow(true)

      const startX = e.clientX - depthOfMarketPosition.x
      const startY = e.clientY - depthOfMarketPosition.y

      const handleMouseMove = (e: MouseEvent) => {
        setDepthOfMarketPosition({
          x: e.clientX - startX,
          y: e.clientY - startY,
        })
      }

      const handleMouseUp = () => {
        setIsDraggingWindow(false)
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    },
    [depthOfMarketPosition],
  )

  const handleHorizontalMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDraggingHorizontal(true)
  }, [])

  const handleHorizontalMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingHorizontal) return
      const newWidth = Math.max(300, Math.min(600, e.clientX - 8))
      setLeftPanelWidth(newWidth)
    },
    [isDraggingHorizontal],
  )

  const handleHorizontalMouseUp = useCallback(() => {
    setIsDraggingHorizontal(false)
  }, [])

  const handleVerticalMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDraggingVertical(true)
  }, [])

  const handleVerticalMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingVertical) return
      const windowHeight = window.innerHeight
      const newHeight = Math.max(150, Math.min(400, windowHeight - e.clientY - 8))
      setPositionsHeight(newHeight)
    },
    [isDraggingVertical],
  )

  const handleVerticalMouseUp = useCallback(() => {
    setIsDraggingVertical(false)
  }, [])

  const handleQuickTrade = (symbol: string, side: OrderSide, quantity: number) => {
    // Placeholder for quick trade logic
    console.log(`Quick trade for ${symbol} ${side} ${quantity}`)
  }

  const handleBidClick = (symbol: string) => {
    setSelectedInstrument(symbol)
    setShowTradeModal(true)
  }

  const handleAskClick = (symbol: string) => {
    setSelectedInstrument(symbol)
    setShowTradeModal(true)
  }

  useEffect(() => {
    if (isDraggingHorizontal) {
      document.addEventListener("mousemove", handleHorizontalMouseMove)
      document.addEventListener("mouseup", handleHorizontalMouseUp)
      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"
    } else {
      document.removeEventListener("mousemove", handleHorizontalMouseMove)
      document.removeEventListener("mouseup", handleHorizontalMouseUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }

    return () => {
      document.removeEventListener("mousemove", handleHorizontalMouseMove)
      document.removeEventListener("mouseup", handleHorizontalMouseUp)
    }
  }, [isDraggingHorizontal, handleHorizontalMouseMove, handleHorizontalMouseUp])

  useEffect(() => {
    if (isDraggingVertical) {
      document.addEventListener("mousemove", handleVerticalMouseMove)
      document.addEventListener("mouseup", handleVerticalMouseUp)
      document.body.style.cursor = "row-resize"
      document.body.style.userSelect = "none"
    } else {
      document.removeEventListener("mousemove", handleVerticalMouseMove)
      document.removeEventListener("mouseup", handleVerticalMouseUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }

    return () => {
      document.removeEventListener("mousemove", handleVerticalMouseMove)
      document.removeEventListener("mouseup", handleVerticalMouseUp)
    }
  }, [isDraggingVertical, handleVerticalMouseMove, handleVerticalMouseUp])

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="bg-black border-b border-slate-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-blue-400 font-bold text-xl">SpiderX</span>
          <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">DEMO</span>
          <span className="text-white font-semibold">TraderGO</span>
        </div>

        <nav className="flex space-x-6 justify-center flex-1">
          <button className="text-white font-medium hover:text-blue-400 transition-colors">TRADING</button>
          <button className="text-slate-400 font-medium hover:text-white transition-colors">RESEARCH</button>
          <button className="text-slate-400 font-medium hover:text-white transition-colors">ACCOUNT</button>
        </nav>

        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Instrument search"
            className="bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="w-8 h-8 bg-slate-600 rounded-full"></div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Section */}
        <div className="flex flex-1 overflow-hidden">
          {!windowsSwapped ? (
            <>
              {/* Left Panel - Trading Instruments */}
              <div
                className="bg-black border-2 border-slate-800 rounded-lg m-2 relative shadow-lg flex flex-col overflow-hidden"
                style={{ width: leftPanelWidth }}
              >
                <div className="bg-slate-800 px-4 py-2 rounded-t-lg flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium text-sm">Trading Instruments</span>
                  </div>
                  <button
                    onClick={handleWindowSwap}
                    className="text-slate-400 hover:text-white transition-colors"
                    title="Swap windows"
                  >
                    ⇄
                  </button>
                </div>

                <div className="p-4 flex-1 overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <h3 className="text-white font-medium">Watchlist</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-300">TraderBoard</span>
                      <button
                        onClick={() => setOneClickTradingEnabled(!oneClickTradingEnabled)}
                        className={`w-10 h-6 rounded-full transition-colors ${
                          oneClickTradingEnabled ? "bg-blue-600" : "bg-slate-600"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            oneClickTradingEnabled ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {oneClickTradingEnabled ? (
                      <div className="grid grid-cols-2 gap-2">
                        {sampleInstruments.slice(0, 6).map((instrument) => (
                          <TradingInstrumentCard
                            key={instrument.symbol}
                            instrument={instrument}
                            onQuickTrade={handleQuickTrade}
                          />
                        ))}
                      </div>
                    ) : (
                      <WatchlistTable
                        instruments={sampleInstruments}
                        onBidClick={handleBidClick}
                        onAskClick={handleAskClick}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div
                className="w-1 bg-slate-700 hover:bg-blue-500 cursor-col-resize transition-colors relative group"
                onMouseDown={handleHorizontalMouseDown}
              >
                <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-500/20" />
              </div>

              {/* Main Chart Area */}
              <div className="flex-1 bg-black border-2 border-slate-800 rounded-lg m-2 shadow-lg flex flex-col overflow-hidden">
                <div className="bg-slate-800 px-4 py-2 rounded-t-lg flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium text-sm">Chart Analysis</span>
                  </div>
                  <button
                    onClick={() => setShowTradeModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm font-medium transition-colors"
                  >
                    Trade {selectedInstrument.split(":")[1] || selectedInstrument}
                  </button>
                </div>

                <div className="p-4 flex-1 overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setRightActiveTab("Charts")}
                        className={`font-medium pb-1 ${rightActiveTab === "Charts" ? "text-blue-400 border-b-2 border-blue-400" : "text-slate-400 hover:text-white"}`}
                      >
                        Charts
                      </button>
                      <button
                        onClick={() => setRightActiveTab("Product overview")}
                        className={`font-medium pb-1 ${rightActiveTab === "Product overview" ? "text-blue-400 border-b-2 border-blue-400" : "text-slate-400 hover:text-white"}`}
                      >
                        Product overview
                      </button>
                      <button
                        onClick={() => setRightActiveTab("Depth of Market")}
                        onMouseDown={handleDetachDepthOfMarket}
                        className={`font-medium pb-1 cursor-move ${rightActiveTab === "Depth of Market" ? "text-blue-400 border-b-2 border-blue-400" : "text-slate-400 hover:text-white"}`}
                        title="Drag to detach window"
                      >
                        Depth of Market
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    {rightActiveTab === "Charts" ? (
                      <TradingViewChart />
                    ) : rightActiveTab === "Product overview" ? (
                      <ProductOverview selectedInstrument={selectedInstrument} />
                    ) : (
                      <DepthOfMarket selectedInstrument={selectedInstrument} />
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex-1 bg-black border-2 border-slate-800 rounded-lg m-2 shadow-lg flex flex-col overflow-hidden">
                <div className="bg-slate-800 px-4 py-2 rounded-t-lg flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium text-sm">Chart Analysis</span>
                  </div>
                  <button
                    onClick={() => setShowTradeModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm font-medium transition-colors"
                  >
                    Trade {selectedInstrument.split(":")[1] || selectedInstrument}
                  </button>
                </div>

                <div className="p-4 flex-1 overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setRightActiveTab("Charts")}
                        className={`font-medium pb-1 ${rightActiveTab === "Charts" ? "text-blue-400 border-b-2 border-blue-400" : "text-slate-400 hover:text-white"}`}
                      >
                        Charts
                      </button>
                      <button
                        onClick={() => setRightActiveTab("Product overview")}
                        className={`font-medium pb-1 ${rightActiveTab === "Product overview" ? "text-blue-400 border-b-2 border-blue-400" : "text-slate-400 hover:text-white"}`}
                      >
                        Product overview
                      </button>
                      <button
                        onClick={() => setRightActiveTab("Depth of Market")}
                        onMouseDown={handleDetachDepthOfMarket}
                        className={`font-medium pb-1 cursor-move ${rightActiveTab === "Depth of Market" ? "text-blue-400 border-b-2 border-blue-400" : "text-slate-400 hover:text-white"}`}
                        title="Drag to detach window"
                      >
                        Depth of Market
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    {rightActiveTab === "Charts" ? (
                      <TradingViewChart />
                    ) : rightActiveTab === "Product overview" ? (
                      <ProductOverview selectedInstrument={selectedInstrument} />
                    ) : (
                      <DepthOfMarket selectedInstrument={selectedInstrument} />
                    )}
                  </div>
                </div>
              </div>

              <div
                className="w-1 bg-slate-700 hover:bg-blue-500 cursor-col-resize transition-colors relative group"
                onMouseDown={handleHorizontalMouseDown}
              >
                <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-500/20" />
              </div>

              <div
                className="bg-black border-2 border-slate-800 rounded-lg m-2 relative shadow-lg flex flex-col overflow-hidden"
                style={{ width: leftPanelWidth }}
              >
                <div className="bg-slate-800 px-4 py-2 rounded-t-lg flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium text-sm">Trading Instruments</span>
                  </div>
                  <button
                    onClick={handleWindowSwap}
                    className="text-slate-400 hover:text-white transition-colors"
                    title="Swap windows"
                  >
                    ⇄
                  </button>
                </div>

                <div className="p-4 flex-1 overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <h3 className="text-white font-medium">Watchlist</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-300">TraderBoard</span>
                      <button
                        onClick={() => setOneClickTradingEnabled(!oneClickTradingEnabled)}
                        className={`w-10 h-6 rounded-full transition-colors ${
                          oneClickTradingEnabled ? "bg-blue-600" : "bg-slate-600"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            oneClickTradingEnabled ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {oneClickTradingEnabled ? (
                      <div className="grid grid-cols-2 gap-2">
                        {sampleInstruments.slice(0, 6).map((instrument) => (
                          <TradingInstrumentCard
                            key={instrument.symbol}
                            instrument={instrument}
                            onQuickTrade={handleQuickTrade}
                          />
                        ))}
                      </div>
                    ) : (
                      <WatchlistTable
                        instruments={sampleInstruments}
                        onBidClick={handleBidClick}
                        onAskClick={handleAskClick}
                      />
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div
          className="h-1 bg-slate-700 hover:bg-blue-500 cursor-row-resize transition-colors relative group mx-2"
          onMouseDown={handleVerticalMouseDown}
        >
          <div className="absolute inset-x-0 -top-1 -bottom-1 group-hover:bg-blue-500/20" />
        </div>

        {/* Bottom Positions Panel */}
        <div
          className="bg-black border-2 border-slate-800 rounded-lg m-2 shadow-lg flex flex-col overflow-hidden"
          style={{ height: positionsHeight }}
        >
          <div className="bg-slate-800 px-4 py-2 rounded-t-lg flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-2">
              <span className="text-white font-medium text-sm">Portfolio Management</span>
            </div>
          </div>

          <div className="p-4 flex-1 overflow-auto scrollbar-hide">
            <table className="w-full">
              <thead className="sticky top-0 bg-black">
                <tr className="text-slate-400 text-sm border-b border-slate-700">
                  <th className="text-left py-2">Product</th>
                  <th className="text-left py-2">Side</th>
                  <th className="text-left py-2">Quantity</th>
                  <th className="text-left py-2">Avg. Price</th>
                  <th className="text-left py-2">Market Price</th>
                  <th className="text-left py-2">PnL</th>
                </tr>
              </thead>
              <tbody>
                {samplePositions.map((position, index) => (
                  <tr key={index} className="border-b border-slate-800 hover:bg-slate-800">
                    <td className="py-3 text-white">{position.symbol}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          position.side === "long" ? "bg-blue-900 text-blue-300" : "bg-red-900 text-red-300"
                        }`}
                      >
                        {position.side}
                      </span>
                    </td>
                    <td className="py-3 text-white">{position.qty.toLocaleString()}</td>
                    <td className="py-3 text-white">{position.avgEntry.toFixed(3)}</td>
                    <td className="py-3 text-white">{position.markPrice.toFixed(5)}</td>
                    <td className={`py-3 font-bold ${position.unrealizedPnL >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {position.unrealizedPnL.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {depthOfMarketDetached && (
        <div
          className="fixed bg-black border-2 border-slate-800 rounded-lg shadow-2xl z-50"
          style={{
            left: depthOfMarketPosition.x,
            top: depthOfMarketPosition.y,
            width: 400,
            height: 500,
          }}
        >
          <div
            className="bg-slate-800 px-4 py-2 rounded-t-lg flex items-center justify-between cursor-move"
            onMouseDown={handleDetachedWindowMouseDown}
          >
            <span className="text-white font-medium text-sm">Depth of Market</span>
            <button
              onClick={() => setDepthOfMarketDetached(false)}
              className="text-slate-400 hover:text-white transition-colors"
              title="Close window"
            >
              ×
            </button>
          </div>
          <div className="p-4 h-full overflow-hidden">
            <DepthOfMarket selectedInstrument={selectedInstrument} />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-black border-t border-slate-800 px-6 py-3 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-6">
          <span className="text-slate-400">TRIAL_s1039730</span>
          <span className="text-slate-400">USD</span>
          <span className="text-slate-400">
            Cash: <span className="text-white">$499,957.57</span>
          </span>
          <span className="text-slate-400">
            Cash available: <span className="text-white">$500,724.02</span>
          </span>
          <span className="text-slate-400">
            Account value: <span className="text-white">$501,107.10</span>
          </span>
          <span className="text-slate-400">
            Margin utilization: <span className="text-blue-400">0.17%</span>
          </span>
        </div>
        <div className="text-slate-500 text-xs">MARKET DATA PROVIDED BY SpiderX BANK • DATA DISCLAIMER</div>
      </footer>
    </div>
  )
}
