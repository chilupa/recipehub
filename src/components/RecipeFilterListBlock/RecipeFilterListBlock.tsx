import React from "react";
import type { RecipeFilterListPageController } from "../../hooks/useRecipeFilterListPage";
import type { Recipe } from "../../types/Recipe";
import RecipeCard from "../RecipeCard";
import RecipeListLoadingBlock from "../RecipeListLoadingBlock";
import ListPageShell from "../ListPageShell";
import RecipeOwnerMenuPopover from "../RecipeOwnerMenuPopover";
import DeleteRecipeConfirmAlert from "../DeleteRecipeConfirmAlert";

export type RecipeFilterListBlockProps = {
  page: RecipeFilterListPageController;
  isEmpty: boolean;
  emptyView: React.ReactNode;
  onRefresh?: () => void | Promise<void>;
  listClassName?: string;
  showMenuForRecipe: (recipe: Recipe) => boolean;
  beforeList?: React.ReactNode;
};

const RecipeFilterListBlock: React.FC<RecipeFilterListBlockProps> = ({
  page,
  isEmpty,
  emptyView,
  onRefresh,
  listClassName,
  showMenuForRecipe,
  beforeList,
}) => {
  const {
    recipes,
    loading,
    load,
    shareRecipe,
    deleteRecipe,
    deleteAlert,
    dismissDeleteAlert,
    popoverOpen,
    dismissPopover,
    openPopover,
    requestDelete,
    favoriteRecipe,
    showErrorToast,
  } = page;

  return (
    <>
      {beforeList}
      <ListPageShell
        loading={loading}
        isEmpty={isEmpty}
        onRefresh={
          onRefresh
            ? async () => {
                await Promise.resolve(onRefresh());
              }
            : undefined
        }
        listClassName={listClassName}
        loadingView={<RecipeListLoadingBlock />}
        emptyView={emptyView}
      >
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onFavorite={favoriteRecipe}
            onShare={shareRecipe}
            onMenuClick={(event, recipeId) => openPopover(event, recipeId)}
            showMenu={showMenuForRecipe(recipe)}
          />
        ))}
      </ListPageShell>

      <RecipeOwnerMenuPopover
        state={popoverOpen}
        recipes={recipes}
        onDismiss={dismissPopover}
        onRequestDelete={requestDelete}
      />

      <DeleteRecipeConfirmAlert
        state={deleteAlert}
        onDismiss={dismissDeleteAlert}
        deleteRecipe={deleteRecipe}
        afterDelete={load}
        onError={showErrorToast}
      />
    </>
  );
};

export default RecipeFilterListBlock;
