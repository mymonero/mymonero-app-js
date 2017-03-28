# MyMonero Desktop & Mobile Apps

![Logo](./assets/logo.png "Logo")

## Why we built the native apps

From MyMonero's creation in 2014 as a web wallet until the release of these downloadable apps in early 2017, the only way to access the service was via a browser on the MyMonero website. Since your spend key is never sent to the server, many operations could not be done on the server, and that meant that a lot of Javascript code had to be sent to and run within your browser (such as creating new wallets, or sending money).

Downloading that Javascript code opened up the possibility of an attacker inserting something malicious which, for example, could theoretically enable them to steal your funds. Another issue, which was actually observed, was that users would simply get misdirected (perhaps by search engine) to a scam/phishing site which was impersonating MyMonero under a different domain, which presumably tricked users into running malicious code.

There were other limitations with the web wallet, such as the inability to use it behind Tor. And, as a downloaded web app, it was significantly limited by the facilities available in common browsers. For example, in the web wallet, users could only access one wallet at a time, had to log in each time, and as a security precaution were quickly logged off once they became idle.

The native apps were conceived of in order to…

* solve the above security issues and feature limitations, 
 
* provide a solid foundation on which to build out and iterate upon a much more featureful experience, and to

* open MyMonero up as a light wallet project for the community to not only find reference implementation examples, but which they can contribute back to and have their contributions shipped and used by everyone else.
