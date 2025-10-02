# Prompt pour Claude Code - Ajout du système de tâches

## Contexte du projet

Je développe une application de gestion de charge mentale partagée pour les foyers. La base Convex est déjà en place avec les tables `households` et `householdMembers`. 

Je veux maintenant ajouter le système de gestion des tâches. Pour l'instant, on se concentre sur deux types simples : les tâches flexibles (qui peuvent être faites n'importe quand) et les tâches one-time (avec une date limite).

## Instructions

J'ai besoin que tu ajoutes les nouvelles tables et fonctionnalités pour le système de tâches.

### 1. Nouvelles tables à ajouter dans `convex/schema.ts`

Ajouter ces deux tables au schéma existant :

```typescript
// TABLE: tasks
interface Task {
  householdId: Id<"households">
  
  // Informations de base
  title: string
  description?: string
  
  // Type de tâche
  type: "flexible" | "one-time"
  
  // Configuration temporelle (pour one-time)
  scheduling?: {
    dueDate?: number
    showBeforeDays?: number  // visible X jours avant (défaut: 7)
  }
  
  // État
  isActive: boolean
  isCompleted: boolean  // pour les one-time
  completedAt?: number
  
  // Métadonnées
  createdAt: number
  createdBy: Id<"householdMembers">
}

// TABLE: taskCompletions
interface TaskCompletion {
  taskId: Id<"tasks">
  householdId: Id<"households">
  
  // Qui et quand
  completedBy: Id<"householdMembers">
  completedAt: number
  
  // Date de référence
  forDate: number
  
  // Contexte
  duration?: number  // en minutes
  notes?: string
  
  // Analytics
  wasLate: boolean
  daysLate?: number
}
```

### 2. Indices à ajouter

Ajouter ces indices pour optimiser les requêtes :

- `tasks` :
  - by_household: ["householdId"]
  - by_household_active: ["householdId", "isActive"]
  - by_household_type: ["householdId", "type"]
- `taskCompletions` :
  - by_task: ["taskId"]
  - by_household: ["householdId"]
  - by_household_date: ["householdId", "completedAt"]
  - by_member: ["completedBy"]

### 3. Créer le fichier `convex/tasks.ts`

Ce fichier contiendra toutes les queries et mutations pour les tâches.

#### Queries à implémenter :

1. **getAvailableTasks** : Récupère toutes les tâches disponibles pour un foyer
   - Paramètres : `householdId`
   - Retourne : 
     - Tâches flexibles non complétées aujourd'hui
     - Tâches one-time dans leur fenêtre de visibilité et non complétées
   - Enrichir avec : dernière personne qui l'a faite, nombre de jours depuis

2. **getTaskHistory** : Historique d'une tâche spécifique
   - Paramètres : `taskId`, `limit` (défaut: 10)
   - Retourne : Les X dernières completions avec infos du membre

3. **getDailyStats** : Stats du jour pour le foyer
   - Paramètres : `householdId`
   - Retourne : Nombre de tâches complétées aujourd'hui par membre

#### Mutations à implémenter :

1. **createTask**
   - Paramètres : `householdId`, `title`, `description?`, `type`, `dueDate?`
   - Validation : Vérifier que l'utilisateur appartient au foyer
   - Retour : La tâche créée

2. **completeTask**
   - Paramètres : `taskId`, `notes?`, `duration?`
   - Actions :
     - Créer une TaskCompletion
     - Si one-time : marquer isCompleted = true
     - Calculer si en retard (pour one-time avec dueDate)
   - Retour : Success + stats (combien de fois faite cette semaine)

3. **uncompleteTask**
   - Paramètres : `taskId`
   - Actions : 
     - Supprimer la dernière completion du jour
     - Si one-time : remettre isCompleted = false

4. **updateTask**
   - Paramètres : `taskId`, updates (title, description, dueDate)
   - Validation : Seul le créateur ou admin peut modifier

5. **deleteTask**
   - Paramètres : `taskId`
   - Validation : Seul le créateur ou admin peut supprimer
   - Action : Soft delete (isActive = false)

### 4. Créer le fichier `convex/lib/taskHelpers.ts`

Fonctions utilitaires pour la logique des tâches :

- `isTaskVisibleToday(task)` : Détermine si une tâche doit être affichée
- `calculateDaysSinceLastCompletion(taskId, completions)` : Calcul pour les stats
- `isTaskOverdue(task)` : Pour les one-time avec dueDate passée
- `getStartOfDay()` : Retourne timestamp du début de journée
- `getEndOfDay()` : Retourne timestamp de fin de journée

### 5. Créer le fichier `convex/taskCompletions.ts`

Queries spécifiques à l'historique :

1. **getMemberStats** : Statistiques d'un membre sur une période
   - Paramètres : `memberId`, `startDate`, `endDate`
   - Retourne : Nombre de tâches, répartition par type, heures les plus actives

2. **getHouseholdWeeklyReport** : Rapport hebdomadaire du foyer
   - Paramètres : `householdId`
   - Retourne : Répartition des tâches par membre, tâches les plus/moins faites

### 6. Ajouter une mutation de seed dans `convex/seed.ts`

Créer ou compléter la mutation `seedTasks` qui :

1. Pour le foyer de test existant, créer 15 tâches flexibles typiques :
   - Vider le lave-vaisselle
   - Passer l'aspirateur
   - Sortir les poubelles
   - Nettoyer la salle de bain
   - Faire les courses
   - Laver les vitres
   - Arroser les plantes
   - Ranger le salon
   - Nettoyer la cuisine
   - Faire la lessive
   - Étendre le linge
   - Repasser
   - Changer les draps
   - Nettoyer les toilettes
   - Passer la serpillière

2. Créer 3 tâches one-time exemples :
   - "Acheter cadeau anniversaire Marie" (due dans 5 jours)
   - "Prendre RDV dentiste" (due dans 10 jours)
   - "Renouveler assurance habitation" (due dans 30 jours)

3. Ajouter quelques completions fictives sur les 7 derniers jours

## Exemple de code attendu pour la query principale

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getAvailableTasks = query({
  args: { 
    householdId: v.id("households")
  },
  handler: async (ctx, args) => {
    // 1. Récupérer toutes les tâches actives du foyer
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_household_active", (q) => 
        q.eq("householdId", args.householdId)
         .eq("isActive", true)
      )
      .collect();
    
    // 2. Récupérer les completions d'aujourd'hui
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const todayCompletions = await ctx.db
      .query("taskCompletions")
      .withIndex("by_household_date", (q) =>
        q.eq("householdId", args.householdId)
         .gte("completedAt", startOfDay.getTime())
      )
      .collect();
    
    // 3. Filtrer et enrichir les tâches
    const availableTasks = tasks.filter(task => {
      // Logique pour déterminer si visible
      if (task.type === "flexible") {
        // Flexible : toujours visible si pas fait aujourd'hui
        return !todayCompletions.some(c => c.taskId === task._id);
      } else {
        // One-time : visible si dans la fenêtre et pas complété
        if (task.isCompleted) return false;
        
        const dueDate = task.scheduling?.dueDate;
        if (!dueDate) return true; // Pas de date = toujours visible
        
        const showBefore = task.scheduling?.showBeforeDays ?? 7;
        const daysToDue = Math.ceil((dueDate - Date.now()) / (1000 * 60 * 60 * 24));
        
        return daysToDue <= showBefore;
      }
    });
    
    // 4. Enrichir avec les dernières completions
    const recentCompletions = await ctx.db
      .query("taskCompletions")
      .withIndex("by_household_date", (q) =>
        q.eq("householdId", args.householdId)
      )
      .order("desc")
      .take(100);
    
    const enrichedTasks = availableTasks.map(task => {
      const taskCompletions = recentCompletions.filter(c => c.taskId === task._id);
      const lastCompletion = taskCompletions[0];
      
      return {
        ...task,
        lastCompletedBy: lastCompletion?.completedBy,
        lastCompletedAt: lastCompletion?.completedAt,
        completionCount: taskCompletions.length,
        daysSinceLastCompletion: lastCompletion 
          ? Math.floor((Date.now() - lastCompletion.completedAt) / (1000 * 60 * 60 * 24))
          : null
      };
    });
    
    return enrichedTasks;
  },
});
```

## Notes importantes

1. **Authentification** : Utilise le système d'auth existant. Récupère le `householdMemberId` depuis le contexte.

2. **Timestamps** : Toujours utiliser `Date.now()` pour les timestamps (millisecondes depuis epoch).

3. **Validation** : Utiliser les validators Convex (`v`) pour tous les arguments des queries/mutations.

4. **Erreurs** : Throw des erreurs explicites avec des messages clairs.

5. **Performance** : Utiliser les index appropriés et limiter les queries avec `.take()` quand c'est pertinent.

## Fichiers à générer

Génère les fichiers dans cet ordre :
1. Mise à jour de `convex/schema.ts` (ajout des nouvelles tables)
2. `convex/lib/taskHelpers.ts`
3. `convex/tasks.ts`
4. `convex/taskCompletions.ts`
5. Mise à jour de `convex/seed.ts` (ajout de seedTasks)

Assure-toi que tout le code est TypeScript valide et suit les bonnes pratiques Convex.
