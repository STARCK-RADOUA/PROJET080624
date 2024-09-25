import * as React from 'react';

export const navigationRef = React.createRef();

export function navigate(name, params) {
  if (navigationRef.current && navigationRef.current.isReady()) {
    if (name === 'Login') {
      // Use reset to clear navigation stack and navigate to Login
      navigationRef.current.reset({
        index: 0,  // Index of the route you want to display (0 for Login)
        routes: [{ name: 'Login', params }],  // New route array
      });
    } else if (name === 'Home') {
      // Use reset to clear navigation stack and navigate to Login
      navigationRef.current.reset({
        index: 0,  // Index of the route you want to display (0 for Login)
        routes: [{ name: 'Home', params }],  // New route array
      });
    }
   
    else {
      navigationRef.current.navigate(name, params);  // Default navigate for other screens
    }
    
  }
}
