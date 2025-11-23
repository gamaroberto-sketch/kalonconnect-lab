"use client";

import React from 'react';
import { Heart, Mail, Phone, MapPin, Instagram, Facebook, Linkedin, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-purple-600 to-blue-600 text-white mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Grid Principal */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Logo e Descrição */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Heart className="w-8 h-8 text-white" fill="currentColor" />
              </div>
              <span className="text-2xl font-bold">Kalon OS</span>
            </div>
            <p className="text-white/90 mb-6 max-w-md">
              Sistema completo para profissionais de saúde mental, com gestão de consultas online, eventos e cursos.
            </p>
            
            {/* Social Media */}
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                title="Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a 
                href="#" 
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                title="Facebook"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a 
                href="#" 
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                title="LinkedIn"
              >
                <Linkedin className="w-6 h-6" />
              </a>
              <a 
                href="#" 
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                title="YouTube"
              >
                <Youtube className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="font-bold text-lg mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <a href="/home" className="text-white/90 hover:text-white transition-colors">
                  Início
                </a>
              </li>
              <li>
                <a href="/events" className="text-white/90 hover:text-white transition-colors">
                  Eventos
                </a>
              </li>
              <li>
                <a href="/consultations" className="text-white/90 hover:text-white transition-colors">
                  Consultas
                </a>
              </li>
              <li>
                <a href="/agendamentos" className="text-white/90 hover:text-white transition-colors">
                  Agendamentos
                </a>
              </li>
              <li>
                <a href="/settings" className="text-white/90 hover:text-white transition-colors">
                  Configurações
                </a>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-white/90">
                <Mail className="w-5 h-5" />
                <span>contato@kalonos.com</span>
              </li>
              <li className="flex items-center space-x-2 text-white/90">
                <Phone className="w-5 h-5" />
                <span>(11) 99999-9999</span>
              </li>
              <li className="flex items-start space-x-2 text-white/90">
                <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                <span>São Paulo, SP - Brasil</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-white/20 pt-8">
          <h3 className="font-bold text-lg mb-4">Newsletter</h3>
          <p className="text-white/90 mb-4">
            Receba atualizações e novidades sobre o Kalon OS
          </p>
          <div className="flex gap-2 max-w-md">
            <input
              type="email"
              placeholder="Seu melhor e-mail"
              className="flex-1 px-4 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="px-6 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Inscrever
            </button>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/70">
          <p>© 2024 Kalon OS. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;



















