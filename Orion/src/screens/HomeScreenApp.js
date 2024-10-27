import { useEffect, useState } from 'react';
import HomeScreen from './HomeScreen';
import HomeScreenSkeleton from './HomeScreenSkeleton';



const HomeScreenApp = () => {
    const [dataLoaded, setDataLoaded] = useState(false);
  
    useEffect(() => {
      // Simulate data loading
      setTimeout(() => setDataLoaded(true), 2000);
    }, []);
  
    return dataLoaded ? (
      <HomeScreen /* Pass required props here */ />
    ) : (
      <HomeScreenSkeleton />
    );
  };
  
  export default HomeScreenApp;