import * as React from './noreact';
import { flatten } from 'array-flatten';

import base = require('./base');
import { ArchiveElt } from '../game';

function showIndividualCard(card: ArchiveElt, index: number) {
  if (index % 2) {
    return <div class="card">
             <div class="player-name">{ card.player_name } drew:</div>
             <img class="card-content" src={ card.phrase_or_drawing } />
           </div>;
  } else {
    return <div class="card">
             <div class="player-name">{ card.player_name } wrote:</div>
             <div class="card-content">{ card.phrase_or_drawing }</div>
           </div>;
  }
}

function showChain(chain : ArchiveElt[], index: number) {
  return [
    <div class="chain-header">
      <h1>Chain { index + 1 }</h1>
    </div>, chain.map(showIndividualCard), 
    <div class="start-and-end">
      <div>
        <div class="player-name">Started with { chain[0].player_name }</div>
        <div class="card-content">{ chain[0].phrase_or_drawing }</div>
      </div>
      <div>
        <div class="player-name">Ended with { chain[chain.length-1].player_name }</div>
        {
          (chain.length-1 % 2)
          ?  <img class="card-content" src={ chain[chain.length-1].phrase_or_drawing } />
          : <div class="card-content">{ chain[chain.length-1].phrase_or_drawing }</div>
        }
      </div>
    </div>]
}

export = (archive: ArchiveElt[][]) => base('archive.js', 'Boobtree game archive',
    <div class="archive">
      { flatten(archive.map(showChain)) }
    </div>);
