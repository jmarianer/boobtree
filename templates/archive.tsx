import * as React from './noreact';
import { flatten } from 'array-flatten';

import base = require('./base');
import { ArchiveElt } from '../game';

function showIndividualCard(card: ArchiveElt, index: number) {
  if (index % 2) {
    return <section class="drawing">
             <div class="content">
               <h1>{ card.player_name } drew:</h1>
               <img src={ card.phrase_or_drawing } />
             </div>
           </section>;
  } else {
    return <section class="text">
             <div class="content">
               <h1>{ card.player_name } wrote:</h1>
               <div class="text">{ card.phrase_or_drawing }</div>
             </div>
           </section>;
  }
}

function showChain(chain : ArchiveElt[], index: number) {
  return <section>
    <section class="chain-header">
      <div class="content">
        <h1>Chain { index + 1 }</h1>
      </div>
    </section>
    { flatten(chain.map(showIndividualCard)) }
    <section class="final">
      <div class="content">
        <div>
          Started with
          <div class="text">{ chain[0].phrase_or_drawing }</div>
        </div>
        <div>
          Ended with
          <div class="text">{ chain[chain.length-1].phrase_or_drawing }</div>
        </div>
      </div>
    </section>
  </section>
}

export = (archive: ArchiveElt[][]) =>
  <html>
    <head>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/3.6.0/css/reveal.min.css" />
      <link rel='stylesheet' href='/style/style.css' />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/3.6.0/js/reveal.min.js" />
      <title>Boobtree game archive</title>
    </head>

    <body>
      <div class="reveal">
        <div class="slides">
          { flatten(archive.map(showChain)) }
        </div>
      </div>
      <script>
        Reveal.initialize({"{hash: true}"});
      </script>
    </body>
  </html>;
