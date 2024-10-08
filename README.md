# A propos de l'API

L'API (Application Programming Interface) Web du JDL est un service accessible parle biais du protocole HTTP ou HTTPS permettant de relier le Blog à sa Base de Données et d'effectuer les calculs intermédiaires.
L'API du JDL est utilisée par chaque utilisateur et par les administrateurs du site, permettant l'accès et la modification des données du Blog (webradio, podcasts, vidéos, articles).

L'API est accessible à l'adresse [api.le-jdl-laroche.cf](https://api.le-jdl-laroche.cf).
L'API n'utilise les cookies que pour l'authentification des administrateurs.

## Vérification des signatures des autorisations de publication

Chaque fois qu'une demande de publication est approuvée ou refusée par un encadrant du JDL, l'API créé une signature électronique grâce à un algorithme de chiffrement asymétrique (RSA) et la stocke dans la base de données. Un chiffrement asymétrique permet à tout le monde de vérifier l'authenticité de la signature, mais seul le serveur de l'API peut la générer. En effet, une clé publique est disponible pour vérifier la signature, mais cette clé ne permet pas de générer une signature.

Vous pouvez utiliser la clé publique pour vérifier la signature des autorisations de publications. Pour cela, rendez-vous sur [un décrypteur RSA en ligne](https://www.csfieldguide.org.nz/en/interactives/rsa-decryption/) et collez la clé publique suivante dans le champ _Key_ :

```plaintext
-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCTNkje4lxdnOuDxg+bn/Yt2ElO
Q2/jk0DLRFb63d+7EeWUtgPIijRXvHTiwaXYtgxW7dMrLYk099OtAf6OKDytn/Mt
OsPn0M3j2eZAyoy9eRJ+LtPK1WafkxNT1USV49A40dy9vHdVkPcC2475ySAtKpiy
H2zxloh7GqN2n1OX/QIDAQAB
-----END PUBLIC KEY-----
```

Puis collez la signature dans le champ _Encrypted message_.

Si le message est valide, le décrypteur RSA affichera le message en clair.

## Hébergement du Blog

Cette API est hébergé chez [Hostim](https://hostim.fr).
Le nom de domaine [le-jdl-laroche.cf](https://le-jdl-laroche.cf) est enregistré chez [Freenom](https://freenom.com).

## Développement de l'API

L'API du JDL utilise la technologie [Express.js](https://expressjs.com), ainsi que différentes librairies Node.js qui lui sont associées. L'utilisation de cette technologie ne concerne que le back-end du Blog (partie non-visible par les utilisateurs, concernant les calculs).

L'API est hébergé sur un server Node.js, qui sert les fichiers, en combinaison avec un server NGINX pour l'acheminement des requêtes.

## _Open source_

Le code source de l'API est disponible sur [GitHub](/https://github.com/Le-JDL-La-Roche/Le-JDL-API) sous licence [GNU GPLv3](https://github.com/Le-JDL-La-Roche/Le-JDL-API/blob/main/LICENSE). Vous pouvez donc le consulter, le modifier et le redistribuer librement, à condition de respecter les termes de la licence.

En cas de problème/bug/suggestion, vous pouvez [ouvrir une _issue_](https://github.com/Le-JDL-La-Roche/Le-JDL-API/issues) sur GitHub.
