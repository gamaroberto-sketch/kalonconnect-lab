"use client";

import React, { useState, useEffect } from 'react';
import { Users, Video, Star, Calendar, Award, Download, Share2 } from 'lucide-react';

const EventsDashboard = () => {
  const [events] = useState([
    { id: '1', name: 'Workshop de Mindfulness', date: '2024-01-15', participants: 24, presence: 22, avgRating: 4.8, replays: 15, certificates: 18 },
    { id: '2', name: 'Curso de Terapia', date: '2024-01-10', participants: 15, presence: 14, avgRating: 4.5, replays: 8, certificates: 12 }
  ]);

  const [stats] = useState({
    totalEvents: 2,
    totalParticipants: 39,
    avgPresence: '92%',
    avgRating: 4.6
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard de Eventos</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <Video className="w-10 h-10 text-blue-500 mb-4" />
            <p className="text-3xl font-bold">{stats.totalEvents}</p>
            <p className="text-gray-600">Eventos</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <Users className="w-10 h-10 text-green-500 mb-4" />
            <p className="text-3xl font-bold">{stats.totalParticipants}</p>
            <p className="text-gray-600">Participantes</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <Star className="w-10 h-10 text-yellow-500 mb-4" />
            <p className="text-3xl font-bold">{stats.avgRating}</p>
            <p className="text-gray-600">Avaliação</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <Video className="w-10 h-10 text-purple-500 mb-4" />
            <p className="text-3xl font-bold">{stats.avgPresence}</p>
            <p className="text-gray-600">Presença</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Histórico de Eventos</h2>
          {events.map(event => (
            <div key={event.id} className="border rounded-lg p-6 mb-4">
              <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{event.date}</span>
                <Users className="w-4 h-4" />
                <span>{event.presence}/{event.participants} presentes</span>
                <Star className="w-4 h-4 fill-yellow-400" />
                <span>{event.avgRating}</span>
                <Download className="w-4 h-4" />
                <span>{event.replays} replays</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventsDashboard;









