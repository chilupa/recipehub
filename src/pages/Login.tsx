import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText
} from '@ionic/react';
import { useAuth } from '../hooks/useAuth';
import AppHeader from '../components/AppHeader';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleLogin = () => {
    console.log('Login clicked', { name, email });
    if (name.trim() && email.trim()) {
      console.log('Calling login function');
      login(name.trim(), email.trim());
    } else {
      console.log('Name or email is empty');
    }
  };

  return (
    <IonPage>
      <AppHeader title="Welcome to RecipeHub" />
      <IonContent className="ion-padding">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <IonText color="medium">
            <h2>Join the Recipe Community</h2>
            <p>Share your favorite recipes with friends</p>
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

        <IonItem>
          <IonLabel position="stacked">Email</IonLabel>
          <IonInput
            type="email"
            value={email}
            onIonInput={(e) => setEmail(e.detail.value!)}
            placeholder="Enter your email"
          />
        </IonItem>

        <IonButton 
          expand="block" 
          onClick={handleLogin}
          disabled={!name.trim() || !email.trim()}
          style={{ margin: '20px 0' }}
        >
          Start Cooking
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Login;