import * as React from './noreact';
import { flatten } from 'array-flatten';

import base = require('./base');
import { ArchiveElt } from '../game';

function showIndividualCard(card: ArchiveElt, index: number) {
  let header = <h3>{ card.player_name }:</h3>;
  if (index % 2) {
    return [header, <img src={ card.phrase_or_drawing } />];
  } else {
    return [header, <div>{ card.phrase_or_drawing }</div>];
  }
}

function showOneThingy(thingy : ArchiveElt[], index: number) {
  return [<h2>Thing { index + 1 }</h2>,
    thingy.map(showIndividualCard)];
}

export = (archive: ArchiveElt[][]) => base('', 'Boobtree game archive',
    ...flatten(archive.map(showOneThingy)));
