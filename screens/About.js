// About.js
import React from 'react';
import { Text, Button } from 'react-native-paper';
import Layout from '../layouts/BaseLayout';

const About = ({ navigation }) => {
  return (
    <Layout>
      <Text>À propos de l'application</Text>
      <Button mode="outlined" onPress={() => navigation.goBack()}>
        Retour
      </Button>
    </Layout>
  );
};

export default About;
