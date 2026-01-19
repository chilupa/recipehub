import React, { useState, useEffect, useId } from 'react';
import {
  IonContent,
  IonPage,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonToast,
  IonText,
  useIonRouter
} from '@ionic/react';

import AppHeader from '../components/AppHeader';
import UserAvatar from '../components/UserAvatar';
import { useAuth } from '../contexts/AuthContext';
import { useRecipes } from '../contexts/RecipeContext';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { recipes } = useRecipes();
  const ionRouter = useIonRouter();
  const [name, setName] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState({ show: false, message: '', color: 'secondary' });

  const hasChanges = () => {
    return name.trim() !== originalName.trim();
  };

  const handleLogout = () => {
    // e.preventDefault();
    logout();

  ionRouter.push('/login', 'root', 'replace');

  }

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = () => {
    try {
      const profileName = user?.name || '';
      setName(profileName);
      setOriginalName(profileName);
    } catch (error) {
      console.log('Error loading profile');
    }
  };

  const saveProfile = () => {
    if (!user || !name.trim()) {
      setShowToast({ show: true, message: 'Please enter your name', color: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const updatedUser = {
        ...user,
        name: name.trim()
      };
      localStorage.setItem('recipe-logger-user', JSON.stringify(updatedUser));
      
      // Update all recipes with the new author name
      const allRecipesStr = localStorage.getItem('recipe-logger-recipes');
      if (allRecipesStr) {
        const allRecipes = JSON.parse(allRecipesStr);
        const updatedRecipes = allRecipes.map((recipe: any) =>
          recipe.userId === user.id
            ? { ...recipe, author: name.trim() }
            : recipe
        );
        localStorage.setItem('recipe-logger-recipes', JSON.stringify(updatedRecipes));
      }
      
      // Dispatch custom event to notify other parts of the app
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'recipe-logger-user',
        newValue: JSON.stringify(updatedUser),
        oldValue: JSON.stringify(user)
      }));
      
      setOriginalName(name.trim());
      setShowToast({ show: true, message: 'Profile updated successfully!', color: 'secondary' });
    } catch (error: any) {
      setShowToast({ show: true, message: 'Error updating profile', color: 'danger' });
    }
    setLoading(false);
  };

  return (
    <IonPage>
      <AppHeader />
      <IonContent className="ion-padding">
        <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', borderRadius: '50%' }}>
              <UserAvatar color="secondary" name={name || user?.email || 'User'} size={80} />
            </div>
            <IonText color="medium">
              <p style={{ marginTop: '10px' }}>{user?.email}</p>
            </IonText>
          </div>

          <IonItem>
            <IonLabel position="stacked">Your Name</IonLabel>
            <IonInput
              value={name}
              onIonInput={(e) => setName(e.detail.value!)}
              placeholder="Enter your name"
            />
          </IonItem>

          <IonButton 
            expand="block" 
            onClick={saveProfile}
            disabled={loading || !hasChanges()}
            style={{ margin: '20px 0' }}
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </IonButton>

          {/* <IonButton 
            expand="block" 
            color="danger"
            onClick={handleLogout}
          >
            Logout
          </IonButton> */}

          <IonToast
            isOpen={showToast.show}
            onDidDismiss={() => setShowToast({ ...showToast, show: false })}
            message={showToast.message}
            duration={3000}
            color={showToast.color}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Profile;