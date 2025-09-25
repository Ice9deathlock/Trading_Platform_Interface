"use client"

import { useState, useEffect, useRef } from "react"
import type React from "react"
import { Badge } from "@/components/ui/badge"

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
  changePercent: string
}

export interface Position {
  symbol: string
  side: "long" | "short"
  qty: number
  avgEntry: number
  markPrice: number
  unrealizedPnL: number
}

interface TradingTab {
  id: string
  symbol: string
  title: string
}

// Sample data
const sampleInstruments = [
  { symbol: "AAPL", name: "Apple Inc.", mid: 227.88, bid: 227.88, ask: 227.89, change: -5.51, changePercent: "-2.36%" },
  { symbol: "CVX", name: "Chevron Corp.", mid: 156.38, ask: 156.38, bid: 158.36, change: 1.53, changePercent: "0.99%" },
  {
    symbol: "CSCO",
    name: "Cisco Systems Inc.",
    mid: 67.86,
    ask: 67.85,
    bid: 67.86,
    change: 0.52,
    changePercent: "0.77%",
  },
  { symbol: "KO", name: "Coca-Cola Co.", mid: 67.35, ask: 67.34, bid: 67.35, change: -0.12, changePercent: "-0.18%" },
  { symbol: "GS", name: "Goldman Sachs", mid: 765.73, ask: 765.37, bid: 765.87, change: 1.81, changePercent: "0.24%" },
  { symbol: "INTC", name: "Intel Corp.", mid: 24.4, ask: 24.4, bid: 24.41, change: -0.04, changePercent: "-0.16%" },
  {
    symbol: "IBM",
    name: "International Business Mac.",
    mid: 259.26,
    ask: 259.16,
    bid: 259.27,
    change: 0.15,
    changePercent: "0.06%",
  },
  {
    symbol: "XOM",
    name: "Exxon Mobil Corporation",
    mid: 111.27,
    ask: 111.3,
    bid: 111.31,
    change: 0.61,
    changePercent: "0.55%",
  },
  {
    symbol: "JPM",
    name: "JPMorgan Chase & Co.",
    mid: 298.73,
    ask: 298.59,
    bid: 298.72,
    change: 0.18,
    changePercent: "0.06%",
  },
  {
    symbol: "JNJ",
    name: "Johnson & Johnson",
    mid: 174.64,
    ask: 174.61,
    bid: 174.65,
    change: -2.32,
    changePercent: "-1.31%",
  },
  {
    symbol: "MCD",
    name: "McDonald's Corp.",
    mid: 306.18,
    ask: 306.07,
    bid: 306.37,
    change: -6.33,
    changePercent: "-2.03%",
  },
  {
    symbol: "MRK",
    name: "Merck & Co. Inc.",
    mid: 83.64,
    ask: 83.67,
    bid: 83.68,
    change: -0.97,
    changePercent: "-1.15%",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    mid: 499.55,
    ask: 499.49,
    bid: 499.63,
    change: 1.15,
    changePercent: "0.23%",
  },
  { symbol: "PFE", name: "Pfizer Inc.", mid: 24.52, ask: 24.51, bid: 24.52, change: -0.2, changePercent: "-0.79%" },
  {
    symbol: "PG",
    name: "Procter & Gamble Co.",
    mid: 156.19,
    ask: 156.17,
    bid: 156.21,
    change: -3.48,
    changePercent: "-2.18%",
  },
  { symbol: "VZ", name: "Verizon Comms", mid: 43.06, ask: 43.06, bid: 43.07, change: -0.51, changePercent: "-1.17%" },
  {
    symbol: "WMT",
    name: "Walmart Inc.",
    mid: 100.91,
    ask: 100.91,
    bid: 100.92,
    change: -1.36,
    changePercent: "-1.33%",
  },
  { symbol: "V", name: "Visa Inc.", mid: 336.7, ask: 336.64, bid: 336.76, change: -7.24, changePercent: "-2.11%" },
  {
    symbol: "TRV",
    name: "The Travelers Companies I.",
    mid: 269.91,
    ask: 269.42,
    bid: 269.72,
    change: -3.94,
    changePercent: "-1.44%",
  },
  {
    symbol: "UNH",
    name: "UnitedHealth Group Inc.",
    mid: 342.81,
    ask: 342.74,
    bid: 342.88,
    change: -5.11,
    changePercent: "-1.47%",
  },
]

const samplePositions = [
  { symbol: "FX:EURUSD", side: "long", qty: 10000, avgEntry: "1.105", markPrice: "1.15856", unrealizedPnL: +535.6 },
  { symbol: "FX:GBPUSD", side: "short", qty: 5000, avgEntry: "1.25", markPrice: "1.34366", unrealizedPnL: -468.3 },
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
  instruments: typeof sampleInstruments
  onBidClick: (symbol: string) => void
  onAskClick: (symbol: string) => void
  onAddSymbol: (symbol: string) => void
}> = ({ instruments, onBidClick, onAskClick, onAddSymbol }) => {
  const [priceDataMap, setPriceDataMap] = useState<{ [key: string]: any }>({})

  useEffect(() => {
    const updatePrices = () => {
      const newPriceData: { [key: string]: any } = {}
      instruments.forEach((instrument) => {
        newPriceData[instrument.symbol] = {
          ...instrument,
          lastTraded: instrument.mid.toFixed(2),
          priceUpdate: "15:15:18",
          marketStatus: "O", // Open
        }
      })
      setPriceDataMap(newPriceData)
    }

    updatePrices()
    const interval = setInterval(updatePrices, 3000)
    return () => clearInterval(interval)
  }, [instruments])

  return (
    <div className="overflow-auto scrollbar-hide">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 px-2 text-muted-foreground font-medium">Instrument</th>
            <th className="text-right py-2 px-2 text-muted-foreground font-medium">Last traded</th>
            <th className="text-right py-2 px-2 text-muted-foreground font-medium">Net</th>
            <th className="text-right py-2 px-2 text-muted-foreground font-medium">% 1D</th>
            <th className="text-right py-2 px-2 text-muted-foreground font-medium">Bid</th>
            <th className="text-right py-2 px-2 text-muted-foreground font-medium">Ask</th>
            <th className="text-center py-2 px-2 text-muted-foreground font-medium">Price update</th>
            <th className="text-center py-2 px-2 text-muted-foreground font-medium">M</th>
          </tr>
        </thead>
        <tbody>
          {instruments.map((instrument) => {
            const priceData = priceDataMap[instrument.symbol] || instrument
            const isPositive = instrument.change >= 0

            return (
              <tr key={instrument.symbol} className="border-b border-border hover:bg-card/50">
                <td className="py-1 px-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-foreground font-medium text-xs">{instrument.name}</span>
                  </div>
                </td>
                <td className="py-1 px-2 text-right text-foreground font-medium text-xs">{priceData.lastTraded}</td>
                <td
                  className={`py-1 px-2 text-right font-medium text-xs ${isPositive ? "text-primary" : "text-destructive"}`}
                >
                  {isPositive ? "+" : ""}
                  {instrument.change.toFixed(2)}
                </td>
                <td
                  className={`py-1 px-2 text-right font-medium text-xs ${isPositive ? "text-primary" : "text-destructive"}`}
                >
                  {instrument.changePercent}
                </td>
                <td className="py-1 px-2 text-right text-foreground font-medium text-xs">
                  {instrument.bid.toFixed(2)}
                </td>
                <td className="py-1 px-2 text-right text-foreground font-medium text-xs">
                  {instrument.ask.toFixed(2)}
                </td>
                <td className="py-1 px-2 text-center text-foreground text-xs">{priceData.priceUpdate}</td>
                <td className="py-1 px-2 text-center">
                  <span className="text-foreground text-xs font-bold">{priceData.marketStatus}</span>
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
  onAddSymbol: (symbol: string) => void
}> = ({ instrument, onQuickTrade, onAddSymbol }) => {
  const [quantity, setQuantity] = useState(0.5)
  const [tolerance, setTolerance] = useState(0)

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(0.1, quantity + delta))
  }

  const handleToleranceChange = (delta: number) => {
    setTolerance(Math.max(0, tolerance + delta))
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 space-y-2">
      {/* Header with country code and symbol */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-slate-400">
            {instrument.symbol.includes("EUR")
              ? "EU"
              : instrument.symbol.includes("GBP")
                ? "GB"
                : instrument.symbol.includes("USD")
                  ? "US"
                  : instrument.symbol.includes("JPY")
                    ? "JP"
                    : "XAU"}
          </span>
          <span className="text-white font-bold text-sm">{instrument.name}</span>
          <span className="text-green-400 text-xs">●</span>
        </div>
        <button
          onClick={() => onAddSymbol(instrument.symbol)}
          className="w-4 h-4 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center text-xs font-bold transition-colors"
          title="Open in new tab"
        >
          +
        </button>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center justify-between">
        <span className="text-slate-300 text-xs font-medium">Quantity</span>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleQuantityChange(-0.1)}
            className="w-5 h-5 bg-slate-700 hover:bg-slate-600 text-white rounded flex items-center justify-center text-xs font-bold"
          >
            −
          </button>
          <span className="text-white font-bold text-sm min-w-[2rem] text-center">{quantity.toFixed(1)}</span>
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
            onClick={() => handleToleranceChange(-1)}
            className="w-5 h-5 bg-slate-700 hover:bg-slate-600 text-white rounded flex items-center justify-center text-xs font-bold"
          >
            −
          </button>
          <span className="text-white font-bold text-sm min-w-[2rem] text-center">
            {tolerance === 0 ? "Off" : tolerance}
          </span>
          <button
            onClick={() => handleToleranceChange(1)}
            className="w-5 h-5 bg-slate-700 hover:bg-slate-600 text-white rounded flex items-center justify-center text-xs font-bold"
          >
            +
          </button>
        </div>
      </div>

      {/* Net Position and P/L */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-slate-300">Net pos</span>
          <span className="text-white">−</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-300">P/L</span>
          <span className="text-white">−</span>
        </div>
      </div>
    </div>
  )
}

const ProductOverview: React.FC<{ selectedInstrument: string }> = ({ selectedInstrument }) => {
  const symbolInfoRef = useRef<HTMLDivElement>(null)
  const miniChartRef = useRef<HTMLDivElement>(null)
  const technicalAnalysisRef = useRef<HTMLDivElement>(null)
  const companyProfileRef = useRef<HTMLDivElement>(null)
  const fundamentalDataRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadTradingViewWidgets = () => {
      // Symbol Info Widget
      if (symbolInfoRef.current) {
        symbolInfoRef.current.innerHTML = `
          <div class="tradingview-widget-container" style="height:400px;width:100%">
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
              "colorTheme": "dark",
              "isTransparent": false,
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
              "colorTheme": "dark",
              "isTransparent": false,
              "largeChartUrl": "",
              "displayMode": "regular",
              "width": "100%",
              "height": "400",
              "symbol": "${selectedInstrument}",
              "locale": "en"
            }
            </script>
          </div>
        `
      }
    }

    const timer = setTimeout(loadTradingViewWidgets, 100)
    return () => clearTimeout(timer)
  }, [selectedInstrument])

  return (
    <div className="space-y-4 p-4 overflow-y-auto scrollbar-hide">
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

const TradingViewChart = ({ selectedInstrument }: { selectedInstrument: string }) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartId = useRef(
    `tradingview_${selectedInstrument.replace(/[^a-zA-Z0-9]/g, "_")}_${Math.random().toString(36).substr(2, 9)}`,
  )

  useEffect(() => {
    if (!chartRef.current) return

    console.log("[v0] Loading TradingView chart for symbol:", selectedInstrument)

    // Clear existing widget
    chartRef.current.innerHTML = ""

    // Load TradingView script if not already loaded
    if (!window.TradingView) {
      const script = document.createElement("script")
      script.src = "https://s3.tradingview.com/tv.js"
      script.async = true
      script.onload = () => {
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
          symbol: selectedInstrument,
          interval: "D",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#1e293b",
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: chartId.current,
          studies: ["Volume@tv-basicstudies"],
          overrides: {
            "paneProperties.background": "#0f172a",
            "paneProperties.vertGridProperties.color": "#334155",
            "paneProperties.horzGridProperties.color": "#334155",
            "symbolWatermarkProperties.transparency": 90,
            "scalesProperties.textColor": "#cbd5e1",
          },
        })
      }
    }
  }, [selectedInstrument])

  return <div ref={chartRef} id={chartId.current} className="w-full h-full" />
}

const DraggableWidget: React.FC<{
  id: string
  title: string
  icon: string
  description: string
}> = ({ id, title, icon, description }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ id, title, icon }))
    e.dataTransfer.effectAllowed = "copy"
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="bg-slate-800 border border-slate-700 rounded-lg p-3 cursor-grab hover:bg-slate-700 transition-colors group"
    >
      <div className="flex items-center space-x-3">
        <div className="text-2xl">{icon}</div>
        <div>
          <h4 className="text-white font-medium text-sm">{title}</h4>
          <p className="text-slate-400 text-xs">{description}</p>
        </div>
      </div>
      <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center text-xs text-slate-400">
          <span className="mr-2">DRAG & DROP</span>
          <span>→</span>
        </div>
      </div>
    </div>
  )
}

const WorkspaceDropZone: React.FC<{
  onDrop: (widgetData: any) => void
  hasWidgets: boolean
  droppedWidgets: any[]
  onRemoveWidget: (index: number) => void
  onReorderWidgets: (fromIndex: number, toIndex: number) => void
}> = ({ onDrop, hasWidgets, droppedWidgets, onRemoveWidget, onReorderWidgets }) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [resizingWidget, setResizingWidget] = useState<number | null>(null)
  const [draggedWidgetIndex, setDraggedWidgetIndex] = useState<number | null>(null)
  const [widgetSizes, setWidgetSizes] = useState<{ [key: number]: { width: number; height: number } }>({})

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const widgetData = JSON.parse(e.dataTransfer.getData("text/plain"))
    onDrop(widgetData)
  }

  const handleWidgetDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ type: "reorder", index }))
    e.dataTransfer.effectAllowed = "move"
    setDraggedWidgetIndex(index)
  }

  const handleWidgetDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    const data = JSON.parse(e.dataTransfer.getData("text/plain"))
    if (data.type === "reorder" && data.index !== targetIndex) {
      onReorderWidgets(data.index, targetIndex)
    }
    setDraggedWidgetIndex(null)
  }

  const handleResizeStart = (e: React.MouseEvent, widgetIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    setResizingWidget(widgetIndex)

    const startX = e.clientX
    const startY = e.clientY
    const currentSize = widgetSizes[widgetIndex] || { width: 300, height: 200 }

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY

      const newWidth = Math.max(200, currentSize.width + deltaX)
      const newHeight = Math.max(150, currentSize.height + deltaY)

      setWidgetSizes((prev) => ({
        ...prev,
        [widgetIndex]: { width: newWidth, height: newHeight },
      }))
    }

    const handleMouseUp = () => {
      setResizingWidget(null)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  const handleCloseWidget = (e: React.MouseEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    onRemoveWidget(index)
    setWidgetSizes((prev) => {
      const newSizes = { ...prev }
      delete newSizes[index]
      return newSizes
    })
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-1 rounded-lg border-2 border-dashed transition-all ${
        isDragOver ? "border-blue-500 bg-blue-500/10" : hasWidgets ? "border-slate-700" : "border-slate-600"
      }`}
    >
      {!hasWidgets ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-8">
          <div className="mb-8">
            <h2 className="text-2xl text-slate-300 mb-4">Drag first widget on the workspace</h2>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 p-4 h-full overflow-auto scrollbar-hide">
          {droppedWidgets.map((widget, index) => {
            const size = widgetSizes[index] || { width: 300, height: 200 }
            return (
              <div
                key={index}
                className="bg-slate-800 border border-slate-700 rounded-lg relative group"
                style={{ width: `${size.width}px`, height: `${size.height}px` }}
                draggable
                onDragStart={(e) => handleWidgetDragStart(e, index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleWidgetDrop(e, index)}
              >
                <div className="flex items-center justify-between p-3 border-b border-slate-700">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{widget.icon}</span>
                    <h3 className="text-white font-medium text-sm">{widget.title}</h3>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onMouseDown={(e) => handleResizeStart(e, index)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white transition-all cursor-se-resize"
                      title="Resize"
                    >
                      ⤡
                    </button>
                    <button
                      onClick={(e) => handleCloseWidget(e, index)}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="p-3 h-full overflow-auto scrollbar-hide">
                  <p className="text-slate-300 text-sm">{widget.title} content would go here</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function TradingPlatform() {
  const [activeTab, setActiveTab] = useState<"trading" | "charts" | "news" | "account">("trading")
  const [selectedInstrument, setSelectedInstrument] = useState("EURUSD")
  const [leftPanelWidth, setLeftPanelWidth] = useState(320)
  const [positionsHeight, setPositionsHeight] = useState(200)
  const [tradingInstrumentsHidden, setTradingInstrumentsHidden] = useState(false)
  const [showDepthOfMarket, setShowDepthOfMarket] = useState(false)
  const [chartActiveTab, setChartActiveTab] = useState<"charts" | "overview">("charts")

  const [eurUsdPrice, setEurUsdPrice] = useState(1.16831)
  const [eurUsdChange, setEurUsdChange] = useState(-0.00037)
  const [eurUsdChangePercent, setEurUsdChangePercent] = useState(-0.03)

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-foreground">SaxoTraderPRO</h1>
              <Badge variant="secondary" className="text-xs bg-primary text-primary-foreground">
                BETA
              </Badge>
            </div>

            {/* Navigation */}
            <nav className="flex space-x-1">
              <button
                onClick={() => setActiveTab("trading")}
                className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                  activeTab === "trading"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-card"
                }`}
              >
                Trading
              </button>
              <button
                onClick={() => setActiveTab("charts")}
                className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                  activeTab === "charts"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-card"
                }`}
              >
                Charts
              </button>
              <button
                onClick={() => setActiveTab("news")}
                className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                  activeTab === "news"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-card"
                }`}
              >
                News & Research
              </button>
              <button
                onClick={() => setActiveTab("account")}
                className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                  activeTab === "account"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-card"
                }`}
              >
                Account
              </button>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Instrument search"
                className="bg-input border border-border rounded px-3 py-1 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button className="text-muted-foreground hover:text-foreground">Add Module</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === "trading" && (
          <div className="flex-1 flex">
            {/* Left Panel - Stock Watchlist */}
            {!tradingInstrumentsHidden && (
              <div className="border-r border-border flex flex-col bg-card" style={{ width: `${leftPanelWidth}px` }}>
                {/* Panel Header */}
                <div className="flex items-center justify-between p-3 border-b border-border">
                  <div className="flex items-center space-x-4 text-xs">
                    <h2 className="text-sm font-semibold text-foreground">Stocks US</h2>
                    <span className="text-xs text-muted-foreground">ECUS</span>
                    <span className="text-xs text-muted-foreground">Depth Trader</span>
                    <span className="text-xs text-muted-foreground">Option Chain</span>
                  </div>
                </div>

                {/* Search and Add */}
                <div className="p-3 border-b border-border">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Add instrument"
                      className="flex-1 bg-input border border-border rounded px-2 py-1 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <button className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium hover:bg-primary/90">
                      New
                    </button>
                  </div>
                </div>

                {/* Watchlist Content */}
                <div className="flex-1 overflow-auto scrollbar-hide">
                  <WatchlistTable
                    onAddSymbol={() => {}}
                    onBidClick={() => {}}
                    onAskClick={() => {}}
                    instruments={sampleInstruments}
                  />
                </div>
              </div>
            )}

            {/* Center Panel - EURUSD Trading */}
            <div className="w-80 border-r border-border flex flex-col bg-card">
              {/* EURUSD Header */}
              <div className="p-3 border-b border-border">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-foreground">EURUSD</span>
                  <span className="text-xs text-muted-foreground">Europe/Dollar</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button className="text-muted-foreground hover:text-foreground text-xs">i</button>
                  <button className="text-muted-foreground hover:text-foreground text-xs">≡</button>
                  <button className="text-muted-foreground hover:text-foreground text-xs">⚙</button>
                </div>
              </div>

              {/* Price Display */}
              <div className="p-4 border-b border-border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{eurUsdPrice.toFixed(5)}</div>
                  <div className={`text-sm ${eurUsdChange >= 0 ? "text-primary" : "text-destructive"}`}>
                    {eurUsdChange >= 0 ? "+" : ""}
                    {eurUsdChange.toFixed(5)} ({eurUsdChangePercent.toFixed(2)}%)
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">• Realtime prices</div>
                </div>
              </div>

              {/* Quick Trade Section */}
              <div className="p-4 border-b border-border">
                <div className="text-center mb-3">
                  <div className="text-xs text-muted-foreground mb-2">Quick Trade</div>
                  <div className="flex items-center justify-center space-x-4">
                    {/* SELL Button */}
                    <div className="text-center">
                      <button className="bg-destructive text-destructive-foreground px-6 py-4 rounded font-bold hover:bg-destructive/90">
                        SELL • EUR
                      </button>
                      <div className="mt-2">
                        <div className="text-3xl font-bold text-destructive">21</div>
                        <div className="text-xs text-muted-foreground">Limit @ 1.17</div>
                      </div>
                    </div>

                    {/* Spread */}
                    <div className="text-center px-4">
                      <div className="text-xs text-muted-foreground">0.9</div>
                    </div>

                    {/* BUY Button */}
                    <div className="text-center">
                      <button className="bg-primary text-primary-foreground px-6 py-4 rounded font-bold hover:bg-primary/90">
                        BUY • EUR
                      </button>
                      <div className="mt-2">
                        <div className="text-3xl font-bold text-primary">21</div>
                        <div className="text-xs text-muted-foreground">Limit @ 1.17</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quantity */}
                <div className="text-center mb-3">
                  <div className="text-xs text-muted-foreground mb-1">EUR</div>
                  <div className="text-lg font-bold text-foreground">10,000</div>
                </div>

                {/* Price Tolerance */}
                <div className="mb-4">
                  <div className="text-xs text-muted-foreground mb-1">Price Tolerance</div>
                  <div className="text-sm text-foreground">0.01%</div>
                  <button className="text-xs text-primary hover:underline">Hide Details</button>
                </div>

                {/* Trade Info */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trade fees</span>
                    <span className="text-foreground">3.00 / 3.00 USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Initial margin available</span>
                    <span className="text-foreground">499,489.47 USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Initial margin impact</span>
                    <span className="text-foreground">390.32 / 390.32 USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Maintenance margin impact</span>
                    <span className="text-foreground">194.57 / 194.57 USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Value Date</span>
                    <span className="text-foreground">12-Sep-2025</span>
                  </div>
                </div>
              </div>

              {/* Account Summary */}
              <div className="p-4">
                <div className="text-xs text-muted-foreground mb-2">Account Summary</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TRIAL_21039730</span>
                    <span className="text-foreground">USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cash</span>
                    <span className="text-primary font-medium">499,489.47</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Value of positions</span>
                    <span className="text-foreground">0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total accruals</span>
                    <span className="text-foreground">0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account value</span>
                    <span className="text-foreground">499,489.47</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account value shield</span>
                    <span className="text-primary">Off</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Initial margin reserved</span>
                    <span className="text-foreground">0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Initial margin available</span>
                    <span className="text-primary">499,489.47</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Maintenance margin reserved</span>
                    <span className="text-foreground">0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Maintenance margin available</span>
                    <span className="text-primary">499,489.47</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Margin utilization</span>
                    <span className="text-foreground">0.00%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Margin utilization alert</span>
                    <span className="text-primary">Off</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cash available</span>
                    <span className="text-primary">499,489.47</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Charts */}
            <div className="flex-1 flex flex-col">
              {/* Chart Headers */}
              <div className="flex">
                {/* First Chart Header */}
                <div className="flex-1 p-3 border-b border-r border-border bg-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-foreground">EURUSD 1H</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs">
                      <button className="text-muted-foreground hover:text-foreground">≡</button>
                      <button className="text-muted-foreground hover:text-foreground">⚙</button>
                      <button className="text-muted-foreground hover:text-foreground">↗</button>
                      <button className="text-muted-foreground hover:text-foreground">🔍</button>
                      <button className="text-muted-foreground hover:text-foreground">⚡</button>
                      <button className="text-muted-foreground hover:text-foreground">□</button>
                    </div>
                  </div>
                </div>

                {/* Second Chart Header */}
                <div className="flex-1 p-3 border-b border-border bg-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-foreground">EURUSD 1D</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs">
                      <button className="text-muted-foreground hover:text-foreground">≡</button>
                      <button className="text-muted-foreground hover:text-foreground">⚙</button>
                      <button className="text-muted-foreground hover:text-foreground">↗</button>
                      <button className="text-muted-foreground hover:text-foreground">🔍</button>
                      <button className="text-muted-foreground hover:text-foreground">⚡</button>
                      <button className="text-muted-foreground hover:text-foreground">□</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Content */}
              <div className="flex-1 flex">
                <div className="flex-1 border-r border-border bg-background">
                  <TradingViewChart selectedInstrument="FX:EURUSD" />
                </div>
                <div className="flex-1 bg-background">
                  <TradingViewChart selectedInstrument="FX:EURUSD" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "charts" && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">Charts</h2>
              <p className="text-muted-foreground">Charts functionality coming soon</p>
            </div>
          </div>
        )}

        {activeTab === "news" && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">News & Research</h2>
              <p className="text-muted-foreground">News and research functionality coming soon</p>
            </div>
          </div>
        )}

        {activeTab === "account" && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">Account</h2>
              <p className="text-muted-foreground">Account management functionality coming soon</p>
            </div>
          </div>
        )}

        {/* Bottom Panel - Positions */}
        <div className="border-t border-border flex flex-col bg-card" style={{ height: `${positionsHeight}px` }}>
          {/* Panel Header */}
          <div className="flex items-center justify-between p-3 border-b border-border">
            <div className="flex items-center space-x-4">
              <h2 className="text-sm font-semibold text-foreground">Positions</h2>
              <div className="flex space-x-4 text-xs">
                <button className="text-primary border-b border-primary pb-1">Position list</button>
                <button className="text-muted-foreground hover:text-foreground">Exposure and P/L</button>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-muted-foreground">TRIAL_21039730</span>
              <span className="text-muted-foreground">USD</span>
              <button className="text-muted-foreground hover:text-foreground">Filter</button>
            </div>
          </div>

          {/* Positions Table */}
          <div className="flex-1 overflow-auto scrollbar-hide">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">#</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Status</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">L/S</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Quantity</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Open price</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Current price</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Stop</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Limit</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">P/L</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">P/L (USD)</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">% Price</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Market vs</th>
                </tr>
              </thead>
              <tbody>
                {/* Empty state - no positions */}
                <tr>
                  <td colSpan={12} className="py-8 text-center text-muted-foreground">
                    No positions to display
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border px-6 py-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-6">
            <span>TRIAL_21039730</span>
            <span>USD</span>
            <span>
              Cash: <span className="text-primary font-medium">499,489.47</span>
            </span>
            <span>
              Cash available: <span className="text-primary font-medium">499,724.04</span>
            </span>
            <span>
              Account value: <span className="text-foreground font-medium">499,107.10</span>
            </span>
            <span>
              Initial margin available: <span className="text-primary font-medium">499,527.84</span>
            </span>
            <span>
              Margin utilization: <span className="text-foreground">0.17%</span>
            </span>
            <span>
              Account value shield: <span className="text-primary">Off</span>
            </span>
          </div>
          <div>
            <span>MARKET DATA PROVIDED BY SaxoBank BANK • DATA DISCLAIMER</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
