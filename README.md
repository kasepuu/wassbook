# SOCIAL-NET<img src="https://01.kood.tech/git/kasepuu/social-network/raw/branch/master/frontend/src/logo.svg" alt="Website Icon" width="40" height="40" />ORK

# TODO

- reactist aru saada
- reactiga luua 3 veergu, (praegune kasutaja & grupid , feed, online-users/friends) (nagu facebook noh)
- reactiga teha ülemine navbar, (search users), home button (nagu facebook noh)
- lehte külastades luua ws connection backendi
- ja nii edasi...

* toodo

-
- - user profile (public/private)
- - posts (public/private)
- - followers (friends)
- - chats
- - notifications
- - groups
-
- authentication
- - register -> email, passwd, fname, lname, dobirth, avatar (opt), nickname (opt), aboutMe (opt)
- - - opt => skippable
-
- database tuleb ümber mõelda ja teha
- migration, database migration? -> structured process of managing changes to a database schema.
-
-
- followers
- - follow -> näed tema positusi/feedi
-
- profile, peab sisaldama
- - user information
- - user activity
- - - every post made by the user
- - followers and following
- two types of profile -> public & private
- - private -> only followers can see the feed
- - public -> everybody can see the feed
- - almost private -> only followers chosen by the creator will be able to see it? -> suht idiootne?
-
-
- groups
-
-

## ABOUT

###### This project must:

- be similar to facebook

## USAGE

```
 prepare frontend > npm install --prefix frontend/
 start frontend > npm start --prefix frontend/
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
