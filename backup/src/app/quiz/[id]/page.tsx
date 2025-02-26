/* eslint-disable react/react-in-jsx-scope */
import React from 'react';

export default function Page({ params }: { params: { id: string }}) {
  return <div>Quiz Page for {params.id}</div>;
} 