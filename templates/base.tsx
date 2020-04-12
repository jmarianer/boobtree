import * as React from './noreact';

export = (script: string, title: string, ...body: JSX.Element[]) =>
  <html>
    <head>
      <link rel='stylesheet' href='/style/style.css' />
      <script src={ '/js/' + script } />
      <title>{ title }</title>
    </head>

    <body>
      <h1>{ title }</h1>
      { body }
    </body>
  </html>;
