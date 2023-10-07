# SOCIAL-NET<img src="https://01.kood.tech/git/kasepuu/social-network/raw/branch/master/frontend/src/logo.svg" alt="Website Icon" width="40" height="40" />ORK

### bugid

- register -> account already exists errorit ei tule
- register->uuskasutaja->profile edit->logout viskab errori
- all posts by account -> ei tööta?! iseenda postitusi ei näe löambist
- profiilil -> you are following: näitab kasutajaid, kes pole follow requesti vastu võtnud
- public poste ei näe (oma profiilil)
- grupi postitust commentida (ilma pildita) siis tekib alla katkine pilt "Post" kirjeldusega
- groups nimekirja groupi nime taga lisada (clan tag)
- chattimise ajal ühele unfollow paned ,saad edasi chattida
- chattides 2 kasutajaga, ning 3. kirjutada ühele neist siis näitab user1 või user2 ... istyping (aga sõnum ei jõua kohale :))
- create group formile validation teha!

## ABOUT

- Our social network project is created with React & Golang

###### This project must:

- Be Facebook-like social network with features as such:

* Followers
* Profile
* Posts
* Groups
* Notifications
* Chats

## USAGE

```
 start without docker > sh start.sh
 start with docker > sh start_docker.sh (linux users might have to run with sudo)
 close docker > sh stop_docker.sh
```

### EXISTING USERS

```
if you are too lazy, you can try out the network with dummy accounts (123 is the password):
> sass
> rain
> kasepuu
> juss
> andrei
> erik
```

##### MAIN-REQUIREMENTS

```
up to date node verison (v20.5.1)
up to date npm version (9.8.0)
sqlite3,
docker-compose,
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
