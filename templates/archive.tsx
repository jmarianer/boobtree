import * as React from './noreact';
import { flatten } from 'array-flatten';

import base = require('./base');
import { ArchiveElt } from '../game';

function showIndividualCard(card: ArchiveElt, index: number) {
  if (index % 2) {
    return [
      <h3>{ card.player_name } drew:</h3>,
      <img src={ card.phrase_or_drawing } />
    ];
  } else {
    return [
      <h3>{ card.player_name } wrote:</h3>,
      <div>{ card.phrase_or_drawing }</div>
    ];
  }
}

function showChain(chain : ArchiveElt[], index: number) {
  return <div class="chain">
    <h2>Chain { index + 1 }</h2>
    { chain.map(showIndividualCard)}
  </div>;
}

export = (archive: ArchiveElt[][]) => base('', 'Boobtree game archive',
    ...archive.map(showChain));
