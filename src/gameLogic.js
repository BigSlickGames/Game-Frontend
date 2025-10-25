const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const RANK_VALUES = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

export const createDeck = () => {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, value: RANK_VALUES[rank] });
    }
  }
  return shuffleDeck(deck);
};

export const shuffleDeck = (deck) => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const dealCards = (deck, count) => {
  const dealt = deck.slice(0, count);
  const remaining = deck.slice(count);
  return { dealt, remaining };
};

const getHandRanking = (cards) => {
  if (cards.length < 5) return { rank: 0, highCard: 0 };

  const sortedCards = [...cards].sort((a, b) => b.value - a.value);
  const values = sortedCards.map(c => c.value);
  const suits = sortedCards.map(c => c.suit);

  const valueCounts = {};
  values.forEach(v => valueCounts[v] = (valueCounts[v] || 0) + 1);
  const counts = Object.values(valueCounts).sort((a, b) => b - a);
  const isFlush = suits.every(s => s === suits[0]);
  const isStraight = values.every((v, i) => i === 0 || values[i - 1] === v + 1) ||
    (values[0] === 14 && values[1] === 5 && values[2] === 4 && values[3] === 3 && values[4] === 2);

  if (isStraight && isFlush) return { rank: 9, highCard: values[0] };
  if (counts[0] === 4) return { rank: 8, highCard: values[0] };
  if (counts[0] === 3 && counts[1] === 2) return { rank: 7, highCard: values[0] };
  if (isFlush) return { rank: 6, highCard: values[0] };
  if (isStraight) return { rank: 5, highCard: values[0] };
  if (counts[0] === 3) return { rank: 4, highCard: values[0] };
  if (counts[0] === 2 && counts[1] === 2) return { rank: 3, highCard: values[0] };
  if (counts[0] === 2) return { rank: 2, highCard: values[0] };
  return { rank: 1, highCard: values[0] };
};

export const getBestHand = (holeCards, communityCards) => {
  const allCards = [...holeCards, ...communityCards];
  if (allCards.length < 5) return { rank: 0, highCard: 0, cards: [] };

  let bestHand = { rank: 0, highCard: 0, cards: [] };

  for (let i = 0; i < allCards.length; i++) {
    for (let j = i + 1; j < allCards.length; j++) {
      for (let k = j + 1; k < allCards.length; k++) {
        for (let l = k + 1; l < allCards.length; l++) {
          for (let m = l + 1; m < allCards.length; m++) {
            const hand = [allCards[i], allCards[j], allCards[k], allCards[l], allCards[m]];
            const ranking = getHandRanking(hand);
            if (ranking.rank > bestHand.rank ||
                (ranking.rank === bestHand.rank && ranking.highCard > bestHand.highCard)) {
              bestHand = { ...ranking, cards: hand };
            }
          }
        }
      }
    }
  }

  return bestHand;
};

export const compareHands = (playerHand, dealerHand, communityCards) => {
  const playerBest = getBestHand(playerHand, communityCards);
  const dealerBest = getBestHand(dealerHand, communityCards);

  if (playerBest.rank > dealerBest.rank) return 'player_win';
  if (dealerBest.rank > playerBest.rank) return 'dealer_win';
  if (playerBest.highCard > dealerBest.highCard) return 'player_win';
  if (dealerBest.highCard > playerBest.highCard) return 'dealer_win';
  return 'tie';
};

export const getHandName = (ranking) => {
  const names = {
    9: 'Straight Flush',
    8: 'Four of a Kind',
    7: 'Full House',
    6: 'Flush',
    5: 'Straight',
    4: 'Three of a Kind',
    3: 'Two Pair',
    2: 'Pair',
    1: 'High Card',
    0: 'No Hand'
  };
  return names[ranking] || 'Unknown';
};
