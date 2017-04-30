# MyMonero Desktop & Mobile Apps

![Logo](https://raw.githubusercontent.com/mymonero/mymonero-app-js/master/docs/assets/icon_100.png "Logo")

## Why We Built the Native Apps

(**tl;dr** for better security, and to build better apps.)

From 2014 until the release of these downloadable apps, the MyMonero service was only accessible as a web wallet on the MyMonero website. 

Since your "private spend key" and "wallet seed" must never be sent to the server as a security feature, many operations (such as creating new wallets, and constructing transations to send money) could not be done on the server… and that meant that a lot of Javascript code which reimplements large parts of Monero had to be sent to, and run within users' web browsers.

Loading that Javascript code opened up the possibility of an attacker inserting something malicious which, for example, could theoretically enable them to steal your funds. Another issue - which was actually observed – was users simply getting misdirected (perhaps by search engine) to a phishing site which was impersonating MyMonero under a different domain, which presumably tricked some users into having their keys stolen.

There were other limitations with the web wallet, such as the inability to use it behind Tor. In addition, as a downloaded web app, it was significantly limited by the facilities available in common browsers. For example, in the web wallet, users could only access one wallet at a time, had to log in with keys each time, and as a security precaution, were quickly logged off once they became idle.

The native apps were conceived of in order to:

* solve the above security issues and feature limitations, 
 
* provide a solid foundation on which to build out and iterate upon a much more featureful experience, and to

* open MyMonero up as a lightweight wallet project for the community to use as a reference implementation, and to contribute back to, in order to have their own contributions shipped in the official version for users of MyMonero.
