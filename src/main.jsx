import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { api } from './api';
import { createDeck, dealCards, compareHands, getBestHand, getHandName } from './gameLogic';

function Card({ card, hidden = false }) {
  if (hidden) {
    return (
      <div style={{
        width: '70px',
        height: '100px',
        backgroundColor: '#1a472a',
        border: '2px solid #2d5a3d',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        color: '#fff',
        fontWeight: 'bold',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
      }}>
        ?
      </div>
    );
  }

  const isRed = card.suit === '♥' || card.suit === '♦';
  return (
    <div style={{
      width: '70px',
      height: '100px',
      backgroundColor: '#fff',
      border: '2px solid #333',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      color: isRed ? '#dc3545' : '#000',
      fontWeight: 'bold',
      boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      padding: '4px'
    }}>
      <div style={{ fontSize: '16px' }}>{card.rank}</div>
      <div style={{ fontSize: '28px', marginTop: '-4px' }}>{card.suit}</div>
    </div>
  );
}

function Game() {
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const startNewGame = async () => {
    setLoading(true);
    setMessage('');
    try {
      const deck = createDeck();
      const { dealt: playerHand, remaining: afterPlayer } = dealCards(deck, 2);
      const { dealt: dealerHand, remaining: afterDealer } = dealCards(afterPlayer, 2);

      const game = await api.createGame();
      const updatedGame = await api.updateGame(game.id, {
        deck: afterDealer,
        player_hand: playerHand,
        dealer_hand: dealerHand,
        game_stage: 'preflop',
        player_chips: 1000,
        dealer_chips: 1000,
        pot: 20,
        current_bet: 10,
        player_bet: 10,
        dealer_bet: 10
      });

      setGameState(updatedGame);
      setMessage('New game started! Place your bet or check.');
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const performAction = async (action) => {
    if (!gameState) return;
    setLoading(true);
    try {
      let updatedState = { ...gameState };
      const { deck, community_cards, game_stage } = gameState;

      if (action === 'fold') {
        updatedState.result = 'dealer_win';
        updatedState.dealer_chips += updatedState.pot;
        updatedState.game_stage = 'completed';
        setMessage('You folded. Dealer wins!');
      } else if (action === 'call' || action === 'check') {
        if (game_stage === 'preflop') {
          const { dealt: flop, remaining: afterFlop } = dealCards(deck, 3);
          updatedState.community_cards = flop;
          updatedState.deck = afterFlop;
          updatedState.game_stage = 'flop';
          setMessage('Flop dealt!');
        } else if (game_stage === 'flop') {
          const { dealt: turn, remaining: afterTurn } = dealCards(deck, 1);
          updatedState.community_cards = [...community_cards, ...turn];
          updatedState.deck = afterTurn;
          updatedState.game_stage = 'turn';
          setMessage('Turn dealt!');
        } else if (game_stage === 'turn') {
          const { dealt: river, remaining: afterRiver } = dealCards(deck, 1);
          updatedState.community_cards = [...community_cards, ...river];
          updatedState.deck = afterRiver;
          updatedState.game_stage = 'river';
          setMessage('River dealt!');
        } else if (game_stage === 'river') {
          updatedState.game_stage = 'showdown';
          const result = compareHands(gameState.player_hand, gameState.dealer_hand, updatedState.community_cards);
          updatedState.result = result;

          if (result === 'player_win') {
            updatedState.player_chips += updatedState.pot;
            setMessage('You win!');
          } else if (result === 'dealer_win') {
            updatedState.dealer_chips += updatedState.pot;
            setMessage('Dealer wins!');
          } else {
            updatedState.player_chips += updatedState.pot / 2;
            updatedState.dealer_chips += updatedState.pot / 2;
            setMessage("It's a tie!");
          }
        }
      } else if (action === 'bet') {
        const betAmount = 20;
        if (updatedState.player_chips >= betAmount) {
          updatedState.player_chips -= betAmount;
          updatedState.pot += betAmount;
          updatedState.current_bet += betAmount;
          setMessage(`You bet ${betAmount} chips.`);

          if (Math.random() > 0.5 && updatedState.dealer_chips >= betAmount) {
            updatedState.dealer_chips -= betAmount;
            updatedState.pot += betAmount;
            setMessage(`You bet ${betAmount} chips. Dealer calls.`);
          } else {
            updatedState.result = 'player_win';
            updatedState.player_chips += updatedState.pot;
            updatedState.game_stage = 'completed';
            setMessage('Dealer folds. You win!');
          }
        }
      }

      const updated = await api.updateGame(gameState.id, updatedState);
      setGameState(updated);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getPlayerBestHand = () => {
    if (!gameState || gameState.community_cards.length === 0) return null;
    return getBestHand(gameState.player_hand, gameState.community_cards);
  };

  const getDealerBestHand = () => {
    if (!gameState || gameState.game_stage !== 'showdown') return null;
    return getBestHand(gameState.dealer_hand, gameState.community_cards);
  };

  const canAct = gameState && gameState.game_stage !== 'completed' && gameState.game_stage !== 'showdown';

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f5132',
      backgroundImage: 'radial-gradient(circle at 50% 50%, #1a6343 0%, #0f5132 100%)',
      padding: '20px',
      fontFamily: 'Inter, system-ui, Arial'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{
          textAlign: 'center',
          color: '#fff',
          fontSize: '48px',
          marginBottom: '30px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}>
          21 Hold'em
        </h1>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '30px',
          color: '#fff',
          fontSize: '20px',
          fontWeight: 'bold'
        }}>
          {gameState && (
            <>
              <div>Your Chips: {gameState.player_chips}</div>
              <div>Pot: {gameState.pot}</div>
              <div>Dealer Chips: {gameState.dealer_chips}</div>
            </>
          )}
        </div>

        {!gameState && (
          <div style={{
            textAlign: 'center',
            marginTop: '100px'
          }}>
            <button
              onClick={startNewGame}
              disabled={loading}
              style={{
                padding: '20px 40px',
                fontSize: '24px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
              }}
            >
              {loading ? 'Starting...' : 'Start New Game'}
            </button>
          </div>
        )}

        {gameState && (
          <>
            <div style={{
              backgroundColor: 'rgba(0,0,0,0.3)',
              borderRadius: '12px',
              padding: '30px',
              marginBottom: '30px'
            }}>
              <h2 style={{ color: '#fff', marginBottom: '20px', textAlign: 'center' }}>
                Dealer's Hand
              </h2>
              <div style={{
                display: 'flex',
                gap: '10px',
                justifyContent: 'center',
                marginBottom: '15px'
              }}>
                {gameState.dealer_hand.map((card, idx) => (
                  <Card
                    key={idx}
                    card={card}
                    hidden={gameState.game_stage !== 'showdown'}
                  />
                ))}
              </div>
              {getDealerBestHand() && (
                <div style={{ textAlign: 'center', color: '#ffc107', fontSize: '18px', fontWeight: 'bold' }}>
                  {getHandName(getDealerBestHand().rank)}
                </div>
              )}
            </div>

            {gameState.community_cards.length > 0 && (
              <div style={{
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: '12px',
                padding: '30px',
                marginBottom: '30px'
              }}>
                <h2 style={{ color: '#fff', marginBottom: '20px', textAlign: 'center' }}>
                  Community Cards
                </h2>
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  justifyContent: 'center'
                }}>
                  {gameState.community_cards.map((card, idx) => (
                    <Card key={idx} card={card} />
                  ))}
                </div>
              </div>
            )}

            <div style={{
              backgroundColor: 'rgba(0,0,0,0.3)',
              borderRadius: '12px',
              padding: '30px',
              marginBottom: '30px'
            }}>
              <h2 style={{ color: '#fff', marginBottom: '20px', textAlign: 'center' }}>
                Your Hand
              </h2>
              <div style={{
                display: 'flex',
                gap: '10px',
                justifyContent: 'center',
                marginBottom: '15px'
              }}>
                {gameState.player_hand.map((card, idx) => (
                  <Card key={idx} card={card} />
                ))}
              </div>
              {getPlayerBestHand() && (
                <div style={{ textAlign: 'center', color: '#ffc107', fontSize: '18px', fontWeight: 'bold' }}>
                  {getHandName(getPlayerBestHand().rank)}
                </div>
              )}
            </div>

            {message && (
              <div style={{
                padding: '20px',
                backgroundColor: gameState.result === 'player_win' ? '#28a745' : gameState.result === 'dealer_win' ? '#dc3545' : '#17a2b8',
                color: 'white',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '30px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
              }}>
                {message}
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              {canAct && (
                <>
                  <button
                    onClick={() => performAction('fold')}
                    disabled={loading}
                    style={{
                      padding: '15px 30px',
                      fontSize: '18px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                    }}
                  >
                    Fold
                  </button>
                  <button
                    onClick={() => performAction('check')}
                    disabled={loading}
                    style={{
                      padding: '15px 30px',
                      fontSize: '18px',
                      backgroundColor: '#17a2b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                    }}
                  >
                    Check/Call
                  </button>
                  <button
                    onClick={() => performAction('bet')}
                    disabled={loading}
                    style={{
                      padding: '15px 30px',
                      fontSize: '18px',
                      backgroundColor: '#ffc107',
                      color: '#000',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                    }}
                  >
                    Bet 20
                  </button>
                </>
              )}
              {(gameState.game_stage === 'completed' || gameState.game_stage === 'showdown') && (
                <button
                  onClick={startNewGame}
                  disabled={loading}
                  style={{
                    padding: '15px 30px',
                    fontSize: '18px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                  }}
                >
                  New Game
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Game />);
