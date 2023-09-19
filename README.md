# SOCIAL-NET<img src="https://01.kood.tech/git/kasepuu/social-network/raw/branch/master/frontend/src/logo.svg" alt="Website Icon" width="40" height="40" />ORK

# TODO

- toodo

* bugid:
* - regades uus kasutaja & logides sisse -> followerslisti ilmuvad mingid kasutajad?
* - ws event errorid kui sisse logida (ws in connection state)
* - profile feed on private

* funktsionaalsus:
* - notifications
* - groups

* chati puudused;
* - scrollevent? praegu laeb 10 viimast sõnumit
* - "is typing..." oleks lahe
* - group chat

* profile puudused;
* - profiilil followers and following -> Does the profile displays the users that you follow and the ones who are following you?

* good practice:
* - handlereid vähendada, websocketisse ümber teha?
* - error handlingut juurde, register/login jms formid, ümber disainida
* - kood ilusamaks

* - lõpu asjad:
* - docker
* - db migration

## ABOUT

###### This project must:

- be similar to facebook

## USAGE

```
 start frontend > sh start.sh
 start backend > go run . <port> // port is optional, this will be 8081 by default
```

### EXISTING USERS

```
if you are too lazy, you can try out the forum with dummy accounts (123 is the password):
> m2nky
> 7Eleven
> Isabella
```

### GOOD TO KNOW

```
CHAT indicators:
 🟢online
 ⚪offline
```

##### MAIN-REQUIREMENTS

```
up to date node verison (v20.5.1)
up to date npm version (9.8.0)
sqlite3,
system with golang support,
a modern browser with websocket support
```

###### Recommended videos:

```
Routing > https://www.youtube.com/watch?v=Ul3y1LXxzdU&ab_channel=WebDevSimplified


WebSocket > https://www.youtube.com/watch?v=pKpKv9MKN-E&ab_channel=ProgrammingPercy
```

### Audit questions:

> https://github.com/01-edu/public/blob/master/subjects/social-network/audit/README.md

### Authors:

### [juss](https://01.kood.tech/git/juss) & [kasepuu](https://01.kood.tech/git/kasepuu) & [alavrone](https://01.kood.tech/git/alavrone) & [andreiRedi](https://01.kood.tech/git/andreiRedi) & [laagusra](https://01.kood.tech/git/laagusra)
