import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonToast,
  IonText
} from '@ionic/react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { supabase } from '../lib/supabase';
import AppHeader from '../components/AppHeader';
import UserAvatar from '../components/UserAvatar';

const Profile: React.FC = () => {
  const { user, signOut } = useSupabaseAuth();
  const [name, setName] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState({ show: false, message: '', color: 'success' });

  const hasChanges = () => {
    return name.trim() !== originalName.trim();
  };

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user?.id)
        .single();
      
      if (data) {
        const profileName = data.name || '';
        setName(profileName);
        setOriginalName(profileName);
      }
    } catch (error) {
      console.log('No profile found, will create one');
    }
  };

  const saveProfile = async () => {
    if (!user || !name.trim()) {
      setShowToast({ show: true, message: 'Please enter your name', color: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: name.trim(),
          email: user.email,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setShowToast({ show: true, message: 'Profile updated successfully!', color: 'success' });
    } catch (error: any) {
      setShowToast({ show: true, message: error.message, color: 'danger' });
    }
    setLoading(false);
  };

  return (
    <IonPage>
      <AppHeader title="Profile" showBackButton={true} />
      <IonContent className="ion-padding">
        <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
              <UserAvatar name={name || user?.email || 'User'} size={80} />
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