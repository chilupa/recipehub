/**
 * Shared casual empty-state copy (title + description) for list and search screens.
 */

export type EmptyStateCopy = {
  title: string;
  description: string;
};

/** Fallback when NoData is rendered without props (should be rare). */
export const emptyStateFallback: EmptyStateCopy = {
  title: "Nothing here yet",
  description:
    "Check back soon—we'll show things here when there's something to see.",
};

export const emptyFeedGuest: EmptyStateCopy = {
  title: "Nothing here yet",
  description:
    "No recipes to preview right now—could be a quiet moment or a spotty connection. Pull to refresh.",
};

export const emptyFeedSignedIn: EmptyStateCopy = {
  title: "Nothing here yet",
  description: "Tap + when you're ready to add your first recipe.",
};

export const emptyMyRecipes: EmptyStateCopy = {
  title: "Nothing here yet",
  description: "Tap + to add a recipe—it'll show up in this list.",
};

export const emptyFavorites: EmptyStateCopy = {
  title: "Nothing here yet",
  description: "Heart recipes while you browse and they'll land here.",
};

export const emptySearchPrompt: EmptyStateCopy = {
  title: "Find something good",
  description:
    "We search titles, tags, and descriptions—type above and see what turns up.",
};

export function emptySearchNoResults(query: string): EmptyStateCopy {
  const q = query.trim();
  return {
    title: "Nothing here yet",
    description: q
      ? `Nothing matched “${q}” yet. Try a shorter word or a different spelling.`
      : "Nothing matched that yet. Try another word.",
  };
}

export function emptyTagFilter(tagDisplay: string): EmptyStateCopy {
  return {
    title: "Nothing here yet",
    description: `No one's tagged a recipe “${tagDisplay}” yet—you could be first.`,
  };
}

export const invalidTagLink: EmptyStateCopy = {
  title: "That link didn't work",
  description: "We need a real tag in the URL to show recipes here.",
};

export function emptyTotalTimeFilter(totalMinutes: number): EmptyStateCopy {
  return {
    title: "Nothing here yet",
    description: `No recipes at ${totalMinutes} minutes total (prep + cook) yet.`,
  };
}

export const invalidTimeLink: EmptyStateCopy = {
  title: "That link didn't work",
  description: "This URL needs a total time in minutes for us to filter by.",
};

export function emptyServingsFilter(servings: number): EmptyStateCopy {
  const label = servings === 1 ? "1 serving" : `${servings} servings`;
  return {
    title: "Nothing here yet",
    description: `No recipes sized for ${label} yet.`,
  };
}

export const invalidServingsLink: EmptyStateCopy = {
  title: "That link didn't work",
  description: "This URL needs a serving count so we know what to look for.",
};

export const emptyActivity: EmptyStateCopy = {
  title: "Nothing here yet",
  description: "When folks favorite your recipes, you'll see it here.",
};
