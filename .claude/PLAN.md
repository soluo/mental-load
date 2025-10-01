# Plan de développement - Ensemble

Application de partage de charge mentale pour les foyers.

## Légende
- `[ ]` À faire
- `[~]` En cours
- `[x]` Terminé

---

## Phase 1 : Setup du projet

### Infrastructure de base
- [x] Configuration Vite + React 19 + TypeScript
- [x] Configuration Tailwind CSS + shadcn/ui
- [x] Configuration Convex (backend serverless)
- [x] Configuration pnpm et scripts de développement

### Authentification
- [x] Intégration Convex Auth
- [x] Provider Password (email/mot de passe)
- [x] Provider Anonymous (connexion sans compte)
- [x] Composant `AuthForm` (sign-in/sign-up)
- [x] Composant `SignOutButton`

### Système de Households
- [x] Schéma base de données (`households`, `householdMembers`)
- [x] Mutation `createHousehold`
- [x] Mutation `joinHousehold`
- [x] Mutation `leaveHousehold`
- [x] Query `getCurrentHousehold`
- [x] Composant `HouseholdSetup` (création/jointure)
- [x] Composant `HouseholdDashboard` (vue principale)

### Structure de l'app
- [x] Composant `App.tsx` avec routing basé sur l'état d'auth
- [x] Gestion des états de chargement
- [x] Mobile-first design (max-width md centrée)

---

## Phase 2 : Gestion des membres et navigation

### Menu et navigation principale
- [ ] Composant `Header` avec nom du household
- [ ] Composant `Header` avec menu utilisateur (profil, déconnexion)

---

## Phase 3 : Configuration des tâches

### Modèle de données
- [ ] Table `tasks` dans le schéma
- [ ] Champs : titre, description, statut, priorité, catégorie
- [ ] Champs : assignedTo, createdBy, dueDate
- [ ] Champs : récurrence (none, daily, weekly, monthly)
- [ ] Table `taskCategories` (personnalisables par household)

### CRUD des tâches
- [ ] Mutation `createTask`
- [ ] Mutation `updateTask`
- [ ] Mutation `deleteTask`
- [ ] Query `getTasks` (avec filtres)
- [ ] Composant `TaskForm` (création/édition)
- [ ] Validation des données

### Catégories et organisation
- [ ] Catégories par défaut (Courses, Ménage, Administratif, Enfants, etc.)
- [ ] Création de catégories personnalisées
- [ ] Couleurs et icônes pour les catégories
- [ ] Gestion des catégories (CRUD)

### Récurrence et planification
- [ ] Logique de récurrence (daily, weekly, monthly, custom)
- [ ] Génération automatique des tâches récurrentes
- [ ] Date d'échéance et rappels
- [ ] Gestion des jours de la semaine pour récurrence hebdomadaire

### Attribution
- [ ] Attribution à un ou plusieurs membres
- [ ] Auto-attribution
- [ ] Rotation automatique (option)
- [ ] Équilibrage de charge (suggestions d'attribution)

---

## Phase 4 : Utilisation des tâches

### Vues des tâches
- [ ] Vue liste (par défaut, groupée par statut)
- [ ] Vue par catégorie
- [ ] Vue par membre assigné
- [ ] Vue calendrier (hebdomadaire/mensuelle)
- [ ] Filtres (statut, catégorie, membre, date)
- [ ] Recherche de tâches

### Actions sur les tâches
- [ ] Marquer comme complétée
- [ ] Marquer comme en cours
- [ ] Reporter à plus tard (snooze)
- [ ] Réassigner à un autre membre
- [ ] Ajouter des commentaires/notes
- [ ] Composant `TaskCard` avec actions rapides

### Historique
- [ ] Table `taskCompletions` (historique des complétions)
- [ ] Vue historique par tâche
- [ ] Vue historique par membre
- [ ] Export de l'historique

### Statistiques et visualisation
- [ ] Dashboard avec métriques clés
- [ ] Nombre de tâches par membre (actuel)
- [ ] Taux de complétion par membre
- [ ] Répartition par catégorie
- [ ] Graphiques de répartition de charge
- [ ] Tendances temporelles (tâches complétées par semaine/mois)
- [ ] Score de contribution par membre

### Gamification (optionnel)
- [ ] Points par tâche complétée
- [ ] Badges et achievements
- [ ] Tableau de classement friendly
- [ ] Streaks (séries de jours consécutifs)

---

## Phase X : Gestion multi-utilisateurs

### Membres du household
- [ ] Affichage de la liste des membres avec avatars
- [ ] Profils utilisateurs (nom, photo, préférences)
- [ ] Statistiques par membre

### Invitations
- [ ] Génération de codes d'invitation uniques
- [ ] Partage de lien d'invitation
- [ ] Expiration des invitations
- [ ] Validation lors de la jointure via invitation

### Permissions et rôles
- [ ] Rôle "Admin" (créateur du household)
- [ ] Rôle "Membre" (membres standards)
- [ ] Permissions pour créer/modifier/supprimer des tâches
- [ ] Permission pour gérer les membres (admin only)

### Notifications
- [ ] Système de notifications en temps réel (Convex reactivity)
- [ ] Notification lors de l'ajout d'un membre
- [ ] Notification lors de l'attribution d'une tâche
- [ ] Notification de rappel de tâche

---

## Notes de développement

### Prochaines étapes
Commencer par la Phase 2 : améliorer la gestion des membres et la navigation.

### Décisions techniques
- Utiliser les capacités réactives de Convex pour les mises à jour en temps réel
- Privilégier les composants shadcn/ui pour la cohérence visuelle
- Maintenir le mobile-first design
- Optimiser pour les petits households (2-6 personnes)

### Améliorations futures
- Mode hors ligne avec synchronisation
- Intégration calendrier externe (Google Calendar, etc.)
- Templates de tâches prédéfinis
- Import/export de données
- Thème sombre
- Multilingue (i18n)
