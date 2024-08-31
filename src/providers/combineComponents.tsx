import React from 'react';

export const CombineComponents = (...components: React.ComponentType<any>[]) => {
  return ({ children }: { children: React.ReactNode }) => {
    return components.reduceRight((acc, Current) => {
      return <Current>{acc}</Current>;
    }, children);
  };
};