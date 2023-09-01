# A propos de l'API

L'API (Application Programming Interface) Web du JDL est un service accessible parle biais du protocole HTTP ou HTTPS permettant de relier le Blog à sa Base de Données et d'effectuer les calculs intermédiaires.
L'API du JDL est utilisée par chaque utilisateur et par les administrateurs du site, permettant l'accès et la modification des données du Blog (webradio, podcasts, vidéos, articles).

L'API est accessible à l'adresse [api.le-jdl-laroche.cf](https://api.le-jdl-laroche.cf).
L'API n'utilise les cookies que pour l'authentification des  administrateurs.

## Hébergement du Blog

Cette API est hébergé chez [Hostim](https://hostim.fr).
Le nom de domaine [le-jdl-laroche.cf](https://le-jdl-laroche.cf) est enregistré chez [Freenom](https://freenom.com).

## Développement de l'API

L'API du JDL utilise la technologie [Express.js](https://expressjs.com), ainsi que différentes librairies Node.js qui lui sont associées. L'utilisation de cette technologie ne concerne que le back-end du Blog (partie non-visible par les utilisateurs, concernant les calculs).

L'API est hébergé sur un server Node.js, qui sert les fichiers, en combinaison avec un server NGINX pour l'acheminement des requêtes.

## *Open source*

Le code source de l'API est disponible sur [GitHub](/https://github.com/Le-JDL-La-Roche/Le-JDL-API) sous licence [GNU GPLv3](https://github.com/Le-JDL-La-Roche/Le-JDL-API/blob/main/LICENSE). Vous pouvez donc le consulter, le modifier et le redistribuer librement, à condition de respecter les termes de la licence.

En cas de problème/bug/suggestion, vous pouvez [ouvrir une *issue*](https://github.com/Le-JDL-La-Roche/Le-JDL-API/issues) sur GitHub.