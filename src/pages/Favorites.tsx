import React from 'react';
import {
  IonContent,
  IonPage,
  IonGrid,
  IonRow,
  IonCol,
  IonText
} from '@ionic/react';
import { useRecipes } from '../contexts/RecipeContext';
import RecipeCard from '../components/RecipeCard';
import AppHeader from '../components/AppHeader';



const Favorites: React.FC = () => {
  const { recipes, toggleLike, shareRecipe } = useRecipes();
  const favoriteRecipes = recipes.filter(recipe => recipe.isLiked);

  return (
    <IonPage>
      <AppHeader title="RecipeHub" />
      <IonContent fullscreen className="ion-padding">
        {favoriteRecipes.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <IonText color="medium">
              <h2>No favorites yet!</h2>
              <p>Like some recipes to see them here.</p>
            </IonText>
          </div>
        ) : (
          <IonGrid>
            <IonRow>
              {favoriteRecipes.map((recipe) => (
                <IonCol size="12" sizeMd="6" key={recipe.id}>
                  <RecipeCard
                    recipe={recipe}
                    onLike={toggleLike}
                    onShare={shareRecipe}
                    showMenu={false}
                  />
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Favorites;