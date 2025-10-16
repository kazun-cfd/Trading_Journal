const { useState, useEffect } = React;
const { Download, Plus, Trash2, Eye, EyeOff, Save } = lucide;

const ICTTradingPlan = () => {
  // Load trades from localStorage on mount
  const [trades, setTrades] = useState(() => {
    const saved = localStorage.getItem('ictTrades');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [showRules, setShowRules] = useState(true);
  const [newTrade, setNewTrade] = useState({
    date: new Date().toISOString().split('T')[0],
    session: '',
    timeZone: 'CEST',
    pair: '',
    setupType: '',
    entryQuality: '',
    entry: '',
    sl: '',
    tp: '',
    rr: '',
    outcome: '',
    pips: '',
    notes: ''
  });

  // Save trades to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('ictTrades', JSON.stringify(trades));
  }, [trades]);

  const sessions = ['London Kill Zone', 'New York Kill Zone', 'NY PM Session', 'Asian Session'];
  const timeZones = ['CET (Winter)', 'CEST (Summer)'];
  const pairs = ['XAUUSD', 'GBPUSD', 'EURUSD'];
  const setupTypes = [
    'Liquidity Grab + MSS',
    'Silver Bullet',
    'FVG Continuation',
    'Breakaway Gap',
    'Order Block',
    'Mitigation Block'
  ];
  const entryQualities = ['A+ (Perfect)', 'A (Very Good)', 'B (Good)', 'C (Acceptable)', 'D (Marginal)'];
  const outcomes = ['Win', 'Loss', 'Breakeven', 'Ongoing'];

  const sessionTimes = {
    'London Kill Zone': { CET: '08:00 - 11:00', CEST: '09:00 - 12:00' },
    'New York Kill Zone': { CET: '14:30 - 17:00', CEST: '15:30 - 18:00' },
    'NY PM Session': { CET: '19:00 - 21:00', CEST: '20:00 - 22:00' },
    'Asian Session': { CET: '02:00 - 07:00', CEST: '03:00 - 08:00' }
  };

  const setupRules = {
    'Liquidity Grab + MSS': {
      description: 'Price sweeps liquidity (Asian high/low) then reverses with market structure shift',
      pairs: 'GBPUSD, EURUSD',
      session: 'London Kill Zone',
      entry: '1. Wait for liquidity sweep\n2. Confirm MSS (break of structure)\n3. Enter on FVG or Order Block\n4. Skip first 15 min of session',
      sl: 'Above/below the liquidity sweep wick (5-15 pips)',
      tp: 'Target opposite liquidity or 1:2 to 1:3 RR',
      notes: 'Best during London open. Avoid if no clear Asian range.'
    },
    'Silver Bullet': {
      description: 'High-probability reversal/continuation setup during NY kill zone',
      pairs: 'XAUUSD, GBPUSD',
      session: 'New York Kill Zone',
      entry: '1. Identify NY session bias\n2. Wait for liquidity grab\n3. Enter after MSS + FVG forms\n4. Must be within 14:30-17:00 CET / 15:30-18:00 CEST',
      sl: 'Beyond the swing point (XAUUSD: 0.5-1.5$, FX: 5-15 pips)',
      tp: 'Target 1:2 minimum, scale out at 1:2 and 1:3',
      notes: 'One of the highest win-rate setups. Trade only during kill zone window.'
    },
    'FVG Continuation': {
      description: 'Join existing trend after displacement creates fair value gap',
      pairs: 'XAUUSD, GBPUSD, EURUSD',
      session: 'London or New York Kill Zone',
      entry: '1. Identify strong directional move\n2. Wait for pullback into FVG\n3. Enter on bounce from FVG\n4. Confirm with lower timeframe MSS',
      sl: 'Below/above FVG (tight stops)',
      tp: '1:2 to 1:3, or next liquidity pool',
      notes: 'Works best in trending conditions. Skip if FVG is too large (>20 pips).'
    },
    'Breakaway Gap': {
      description: 'Gap created during high-momentum breakout, rarely fills',
      pairs: 'XAUUSD, GBPUSD',
      session: 'Any Kill Zone',
      entry: '1. Identify clean breakout with gap\n2. Wait for minor pullback\n3. Enter on 50% gap retracement\n4. Must have volume confirmation',
      sl: 'Beyond gap high/low',
      tp: 'Measured move or next structure',
      notes: 'Rare setup. High conviction when it appears.'
    },
    'Order Block': {
      description: 'Last bullish/bearish candle before strong move, acts as support/resistance',
      pairs: 'All pairs',
      session: 'Any session',
      entry: '1. Mark last opposite candle before impulse\n2. Wait for price to return\n3. Enter on reaction (wick/engulf)\n4. Confirm with lower TF structure',
      sl: 'Beyond order block',
      tp: '1:2 minimum',
      notes: 'Combine with FVG or liquidity sweep for higher probability.'
    },
    'Mitigation Block': {
      description: 'Institutional order zone where price seeks liquidity before continuing',
      pairs: 'All pairs',
      session: 'Any Kill Zone',
      entry: '1. Identify unmitigated block\n2. Wait for price to tap zone\n3. Enter on rejection\n4. Confirm momentum shift',
      sl: '5-10 pips beyond block',
      tp: 'Next opposing block or 1:2 RR',
      notes: 'Works best when aligned with higher timeframe bias.'
    }
  };

  const addTrade = () => {
    if (newTrade.date && newTrade.session && newTrade.pair && newTrade.setupType) {
      setTrades([...trades, { ...newTrade, id: Date.now() }]);
      setNewTrade({
        date: new Date().toISOString().split('T')[0],
        session: '',
        timeZone: 'CEST',
        pair: '',
        setupType: '',
        entryQuality: '',
        entry: '',
        sl: '',
        tp: '',
        rr: '',
        outcome: '',
        pips: '',
        notes: ''
      });
    }
  };

  const deleteTrade = (id) => {
    if (confirm('Delete this trade?')) {
      setTrades(trades.filter(t => t.id !== id));
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Session', 'Time Zone', 'Pair', 'Setup Type', 'Entry Quality', 'Entry', 'SL', 'TP', 'R:R', 'Outcome', 'Pips/Points', 'Notes'];
    const rows = trades.map(t => [
      t.date, t.session, t.timeZone, t.pair, t.setupType, t.entryQuality, 
      t.entry, t.sl, t.tp, t.rr, t.outcome, t.pips, t.notes
    ]);
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ict_trades_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const stats = {
    total: trades.length,
    wins: trades.filter(t => t.outcome === 'Win').length,
    losses: trades.filter(t => t.outcome === 'Loss').length,
    winRate: trades.length > 0 ? ((trades.filter(t => t.outcome === 'Win').length / trades.filter(t => t.outcome !== 'Ongoing').length) * 100).toFixed(1) : 0
  };

  return React.createElement('div', { className: 'min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4' },
    React.createElement('div', { className: 'max-w-7xl mx-auto' },
      
      // Header
      React.createElement('div', { className: 'bg-slate-800 rounded-lg p-6 mb-6 border border-blue-500/30' },
        React.createElement('h1', { className: 'text-3xl font-bold text-blue-400 mb-2' }, 'ICT Trading Plan - Berlin Time'),
        React.createElement('p', { className: 'text-slate-300' }, 'Rule-based scalping system for XAUUSD, GBPUSD, EURUSD'),
        React.createElement('p', { className: 'text-xs text-green-400 mt-2' }, '✅ Your trades are automatically saved in your browser'),
        
        // Quick Stats
        React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-4 mt-4' },
          React.createElement('div', { className: 'bg-slate-700/50 p-3 rounded' },
            React.createElement('div', { className: 'text-slate-400 text-sm' }, 'Total Trades'),
            React.createElement('div', { className: 'text-2xl font-bold text-white' }, stats.total)
          ),
          React.createElement('div', { className: 'bg-green-900/30 p-3 rounded border border-green-500/30' },
            React.createElement('div', { className: 'text-slate-400 text-sm' }, 'Wins'),
            React.createElement('div', { className: 'text-2xl font-bold text-green-400' }, stats.wins)
          ),
          React.createElement('div', { className: 'bg-red-900/30 p-3 rounded border border-red-500/30' },
            React.createElement('div', { className: 'text-slate-400 text-sm' }, 'Losses'),
            React.createElement('div', { className: 'text-2xl font-bold text-red-400' }, stats.losses)
          ),
          React.createElement('div', { className: 'bg-blue-900/30 p-3 rounded border border-blue-500/30' },
            React.createElement('div', { className: 'text-slate-400 text-sm' }, 'Win Rate'),
            React.createElement('div', { className: 'text-2xl font-bold text-blue-400' }, stats.winRate + '%')
          )
        )
      ),

      // Session Times Reference
      React.createElement('div', { className: 'bg-slate-800 rounded-lg p-6 mb-6 border border-blue-500/30' },
        React.createElement('h2', { className: 'text-xl font-bold text-blue-400 mb-4' }, '📍 Berlin Session Times'),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4' },
          Object.entries(sessionTimes).map(([session, times]) =>
            React.createElement('div', { key: session, className: 'bg-slate-700/50 p-4 rounded' },
              React.createElement('div', { className: 'font-semibold text-white mb-2' }, session),
              React.createElement('div', { className: 'text-sm text-slate-300' },
                React.createElement('div', null, '🌙 Winter: ' + times.CET),
                React.createElement('div', null, '☀️ Summer: ' + times.CEST)
              )
            )
          )
        )
      ),

      // Setup Rules
      React.createElement('div', { className: 'bg-slate-800 rounded-lg p-6 mb-6 border border-blue-500/30' },
        React.createElement('div', { className: 'flex items-center justify-between mb-4' },
          React.createElement('h2', { className: 'text-xl font-bold text-blue-400' }, '📋 Setup Rules Reference'),
          React.createElement('button', {
            onClick: () => setShowRules(!showRules),
            className: 'flex items-center gap-2 text-slate-300 hover:text-blue-400'
          }, showRules ? 'Hide Rules' : 'Show Rules')
        ),
        
        showRules && React.createElement('div', { className: 'space-y-4' },
          Object.entries(setupRules).map(([setup, rules]) =>
            React.createElement('div', { key: setup, className: 'bg-slate-700/50 p-4 rounded border border-slate-600' },
              React.createElement('h3', { className: 'text-lg font-bold text-blue-300 mb-2' }, setup),
              React.createElement('p', { className: 'text-slate-300 mb-3' }, rules.description),
              React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-3 text-sm' },
                React.createElement('div', null,
                  React.createElement('span', { className: 'text-slate-400 font-semibold' }, 'Pairs:'),
                  React.createElement('span', { className: 'text-white ml-2' }, rules.pairs)
                ),
                React.createElement('div', null,
                  React.createElement('span', { className: 'text-slate-400 font-semibold' }, 'Session:'),
                  React.createElement('span', { className: 'text-white ml-2' }, rules.session)
                ),
                React.createElement('div', { className: 'col-span-2' },
                  React.createElement('span', { className: 'text-slate-400 font-semibold' }, 'Entry Rules:'),
                  React.createElement('pre', { className: 'text-white ml-2 mt-1 whitespace-pre-wrap text-xs' }, rules.entry)
                ),
                React.createElement('div', null,
                  React.createElement('span', { className: 'text-slate-400 font-semibold' }, 'Stop Loss:'),
                  React.createElement('span', { className: 'text-white ml-2' }, rules.sl)
                ),
                React.createElement('div', null,
                  React.createElement('span', { className: 'text-slate-400 font-semibold' }, 'Take Profit:'),
                  React.createElement('span', { className: 'text-white ml-2' }, rules.tp)
                ),
                React.createElement('div', { className: 'col-span-2' },
                  React.createElement('span', { className: 'text-yellow-400 font-semibold' }, '⚠️ Notes:'),
                  React.createElement('span', { className: 'text-slate-300 ml-2' }, rules.notes)
                )
              )
            )
          )
        )
      ),

      // Add New Trade Form
      React.createElement('div', { className: 'bg-slate-800 rounded-lg p-6 mb-6 border border-blue-500/30' },
        React.createElement('h2', { className: 'text-xl font-bold text-blue-400 mb-4' }, '➕ Log New Trade'),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' },
          React.createElement('input', {
            type: 'date',
            value: newTrade.date,
            onChange: (e) => setNewTrade({...newTrade, date: e.target.value}),
            className: 'bg-slate-700 text-white p-2 rounded border border-slate-600'
          }),
          
          React.createElement('select', {
            value: newTrade.session,
            onChange: (e) => setNewTrade({...newTrade, session: e.target.value}),
            className: 'bg-slate-700 text-white p-2 rounded border border-slate-600'
          },
            React.createElement('option', { value: '' }, 'Select Session'),
            sessions.map(s => React.createElement('option', { key: s, value: s }, s))
          ),

          React.createElement('select', {
            value: newTrade.timeZone,
            onChange: (e) => setNewTrade({...newTrade, timeZone: e.target.value}),
            className: 'bg-slate-700 text-white p-2 rounded border border-slate-600'
          },
            timeZones.map(tz => React.createElement('option', { key: tz, value: tz }, tz))
          ),

          React.createElement('select', {
            value: newTrade.pair,
            onChange: (e) => setNewTrade({...newTrade, pair: e.target.value}),
            className: 'bg-slate-700 text-white p-2 rounded border border-slate-600'
          },
            React.createElement('option', { value: '' }, 'Select Pair'),
            pairs.map(p => React.createElement('option', { key: p, value: p }, p))
          ),

          React.createElement('select', {
            value: newTrade.setupType,
            onChange: (e) => setNewTrade({...newTrade, setupType: e.target.value}),
            className: 'bg-slate-700 text-white p-2 rounded border border-slate-600'
          },
            React.createElement('option', { value: '' }, 'Select Setup Type'),
            setupTypes.map(st => React.createElement('option', { key: st, value: st }, st))
          ),

          React.createElement('select', {
            value: newTrade.entryQuality,
            onChange: (e) => setNewTrade({...newTrade, entryQuality: e.target.value}),
            className: 'bg-slate-700 text-white p-2 rounded border border-slate-600'
          },
            React.createElement('option', { value: '' }, 'Entry Quality'),
            entryQualities.map(eq => React.createElement('option', { key: eq, value: eq }, eq))
          ),

          React.createElement('input', {
            type: 'text',
            placeholder: 'Entry Price',
            value: newTrade.entry,
            onChange: (e) => setNewTrade({...newTrade, entry: e.target.value}),
            className: 'bg-slate-700 text-white p-2 rounded border border-slate-600'
          }),

          React.createElement('input', {
            type: 'text',
            placeholder: 'Stop Loss',
            value: newTrade.sl,
            onChange: (e) => setNewTrade({...newTrade, sl: e.target.value}),
            className: 'bg-slate-700 text-white p-2 rounded border border-slate-600'
          }),

          React.createElement('input', {
            type: 'text',
            placeholder: 'Take Profit',
            value: newTrade.tp,
            onChange: (e) => setNewTrade({...newTrade, tp: e.target.value}),
            className: 'bg-slate-700 text-white p-2 rounded border border-slate-600'
          }),

          React.createElement('input', {
            type: 'text',
            placeholder: 'R:R (e.g. 1:2)',
            value: newTrade.rr,
            onChange: (e) => setNewTrade({...newTrade, rr: e.target.value}),
            className: 'bg-slate-700 text-white p-2 rounded border border-slate-600'
          }),

          React.createElement('select', {
            value: newTrade.outcome,
            onChange: (e) => setNewTrade({...newTrade, outcome: e.target.value}),
            className: 'bg-slate-700 text-white p-2 rounded border border-slate-600'
          },
            React.createElement('option', { value: '' }, 'Outcome'),
            outcomes.map(o => React.createElement('option', { key: o, value: o }, o))
          ),

          React.createElement('input', {
            type: 'text',
            placeholder: 'Pips/Points',
            value: newTrade.pips,
            onChange: (e) => setNewTrade({...newTrade, pips: e.target.value}),
            className: 'bg-slate-700 text-white p-2 rounded border border-slate-600'
          }),

          React.createElement('input', {
            type: 'text',
            placeholder: 'Notes',
            value: newTrade.notes,
            onChange: (e) => setNewTrade({...newTrade, notes: e.target.value}),
            className: 'bg-slate-700 text-white p-2 rounded border border-slate-600 md:col-span-2 lg:col-span-3'
          })
        ),

        React.createElement('button', {
          onClick: addTrade,
          className: 'mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded'
        }, '➕ Add Trade')
      ),

      // Trade Log
      React.createElement('div', { className: 'bg-slate-800 rounded-lg p-6 border border-blue-500/30' },
        React.createElement('div', { className: 'flex items-center justify-between mb-4' },
          React.createElement('h2', { className: 'text-xl font-bold text-blue-400' }, '📊 Trade Log'),
          React.createElement('button', {
            onClick: exportToCSV,
            className: 'bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded'
          }, '⬇️ Export CSV')
        ),

        React.createElement('div', { className: 'overflow-x-auto' },
          React.createElement('table', { className: 'w-full text-sm' },
            React.createElement('thead', null,
              React.createElement('tr', { className: 'border-b border-slate-700' },
                React.createElement('th', { className: 'text-left p-2 text-slate-400' }, 'Date'),
                React.createElement('th', { className: 'text-left p-2 text-slate-400' }, 'Session'),
                React.createElement('th', { className: 'text-left p-2 text-slate-400' }, 'Pair'),
                React.createElement('th', { className: 'text-left p-2 text-slate-400' }, 'Setup'),
                React.createElement('th', { className: 'text-left p-2 text-slate-400' }, 'Quality'),
                React.createElement('th', { className: 'text-left p-2 text-slate-400' }, 'R:R'),
                React.createElement('th', { className: 'text-left p-2 text-slate-400' }, 'Outcome'),
                React.createElement('th', { className: 'text-left p-2 text-slate-400' }, 'Pips'),
                React.createElement('th', { className: 'text-left p-2 text-slate-400' })
              )
            ),
            React.createElement('tbody', null,
              trades.length === 0 ?
                React.createElement('tr', null,
                  React.createElement('td', { colSpan: '9', className: 'text-center p-8 text-slate-400' },
                    'No trades logged yet. Add your first trade above!'
                  )
                ) :
                trades.slice().reverse().map(trade =>
                  React.createElement('tr', { key: trade.id, className: 'border-b border-slate-700 hover:bg-slate-700/30' },
                    React.createElement('td', { className: 'p-2 text-white' }, trade.date),
                    React.createElement('td', { className: 'p-2 text-slate-300' }, trade.session),
                    React.createElement('td', { className: 'p-2 text-blue-400 font-semibold' }, trade.pair),
                    React.createElement('td', { className: 'p-2 text-slate-300 text-xs' }, trade.setupType),
                    React.createElement('td', { className: 'p-2 text-slate-300' }, trade.entryQuality.split(' ')[0]),
                    React.createElement('td', { className: 'p-2 text-slate-300' }, trade.rr),
                    React.createElement('td', { className: 'p-2' },
                      React.createElement('span', {
                        className: `px-2 py-1 rounded text-xs ${
                          trade.outcome === 'Win' ? 'bg-green-900/50 text-green-400' :
                          trade.outcome === 'Loss' ? 'bg-red-900/50 text-red-400' :
                          trade.outcome === 'Breakeven' ? 'bg-yellow-900/50 text-yellow-400' :
                          'bg-blue-900/50 text-blue-400'
                        }`
                      }, trade.outcome)
                    ),
                    React.createElement('td', { className: 'p-2 text-white' }, trade.pips),
                    React.createElement('td', { className: 'p-2' },
                      React.createElement('button', {
                        onClick: () => deleteTrade(trade.id),
                        className: 'text-red-400 hover:text-red-300'
                      }, '🗑️')
                    )
                  )
                )
            )
          )
        )
      ),

      // Trading Rules Footer
      React.createElement('div', { className: 'bg-slate-800 rounded-lg p-6 mt-6 border border-yellow-500/30' },
        React.createElement('h3', { className: 'text-lg font-bold text-yellow-400 mb-3' }, '⚠️ Critical Trading Rules'),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300 text-sm' },
          React.createElement('div', null, '✅ Trade only during kill zones'),
          React.createElement('div', null, '✅ Skip first 15 min of each session'),
          React.createElement('div', null, '✅ Max 2-3 quality setups per day'),
          React.createElement('div', null, '✅ Stop after 2 wins or 1 full loss'),
          React.createElement('div', null, '✅ Tight stops: FX 5-15 pips, XAU 0.5-1.5$'),
          React.createElement('div', null, '✅ Minimum 1:2 R:R on every trade'),
          React.createElement('div', null, '✅ Journal every trade with screenshot'),
          React.createElement('div', null, '✅ No trading 5 min before high-impact news')
        )
      )
    )
  );
};

ReactDOM.render(React.createElement(ICTTradingPlan), document.getElementById('root'));
