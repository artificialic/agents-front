// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { apiService } from '@/services';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SelectVoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentVoiceId?: string;
  onSelectVoice: (voiceId: string) => void;
}

export function SelectVoiceModal({ open, onOpenChange, currentVoiceId, onSelectVoice }: SelectVoiceModalProps) {
  const [allVoices, setAllVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'elevenlabs' | 'openai' | 'cartesia' | 'playht'>('elevenlabs');
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [accentFilter, setAccentFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isAddCustomVoiceOpen, setIsAddCustomVoiceOpen] = useState(false);
  const [communityVoices, setCommunityVoices] = useState<any[]>([]);
  const [communitySearchQuery, setCommunitySearchQuery] = useState('');
  const [loadingCommunityVoices, setLoadingCommunityVoices] = useState(false);
  const [selectedCommunityVoice, setSelectedCommunityVoice] = useState<any | null>(null);
  const [editableVoiceName, setEditableVoiceName] = useState('');

  useEffect(() => {
    if (open) {
      fetchAllVoices();
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [audioElement]);

  useEffect(() => {
    if (!isAddCustomVoiceOpen) {
      setSelectedCommunityVoice(null);
      setEditableVoiceName('');
      setCommunityVoices([]);
      setCommunitySearchQuery('');
    }
  }, [isAddCustomVoiceOpen]);

  const fetchAllVoices = async () => {
    try {
      setLoading(true);
      const allVoicesData = await apiService.getVoices();
      setAllVoices(allVoicesData);
    } catch (error) {
      console.error('Error fetching voices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayVoice = (voice: Voice) => {
    if (playingVoiceId === voice.voice_id) {
      if (audioElement) {
        audioElement.pause();
        setPlayingVoiceId(null);
      }
      return;
    }

    if (audioElement) {
      audioElement.pause();
    }

    if (voice.preview_audio_url) {
      const audio = new Audio(voice.preview_audio_url);
      audio.play();
      audio.onended = () => setPlayingVoiceId(null);
      setAudioElement(audio);
      setPlayingVoiceId(voice.voice_id);
    }
  };

  const handleSelectVoice = (voiceId: string) => {
    onSelectVoice(voiceId);
    onOpenChange(false);
  };

  const handleSearchCommunityVoices = async () => {
    if (!communitySearchQuery.trim()) {
      setCommunityVoices([]);
      return;
    }

    try {
      setLoadingCommunityVoices(true);
      const response = await apiService.searchCommunityVoice({
        search_query: communitySearchQuery
      });
      setCommunityVoices(response.voices || []);
    } catch (error) {
      console.error('Error searching community voices:', error);
      setCommunityVoices([]);
    } finally {
      setLoadingCommunityVoices(false);
    }
  };

  const handlePlayCommunityVoice = (voice: any) => {
    if (playingVoiceId === voice.voice_id) {
      if (audioElement) {
        audioElement.pause();
        setPlayingVoiceId(null);
      }
      return;
    }

    if (audioElement) {
      audioElement.pause();
    }

    if (voice.preview_url) {
      const audio = new Audio(voice.preview_url);
      audio.play();
      audio.onended = () => setPlayingVoiceId(null);
      setAudioElement(audio);
      setPlayingVoiceId(voice.voice_id);
    }
  };

  const handleSelectCommunityVoice = (voice: any) => {
    setSelectedCommunityVoice(voice);
    setEditableVoiceName(voice.name || '');
  };

  const handleSaveCommunityVoice = async () => {
    if (!selectedCommunityVoice) return;

    try {
      setLoadingCommunityVoices(true);
      const response = await apiService.addCommunityVoice({
        provider_voice_id: selectedCommunityVoice.voice_id,
        public_user_id: selectedCommunityVoice.public_owner_id,
        voice_name: editableVoiceName
      });

      onSelectVoice(response.voice_id);
      setIsAddCustomVoiceOpen(false);
      onOpenChange(false);
      setSelectedCommunityVoice(null);
      setEditableVoiceName('');
      setCommunityVoices([]);
      setCommunitySearchQuery('');
    } catch (error) {
      console.error('Error adding community voice:', error);
    } finally {
      setLoadingCommunityVoices(false);
    }
  };

  const filteredVoices = allVoices
    .filter((voice) => {
      const matchesProvider = voice.provider === activeTab;
      const matchesSearch = voice.voice_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGender = genderFilter === 'all' || voice.gender?.toLowerCase() === genderFilter.toLowerCase();
      const matchesAccent = accentFilter === 'all' || voice.accent === accentFilter;

      const matchesType =
        typeFilter === 'all' ||
        (typeFilter === 'custom' && voice.voice_type === 'custom') ||
        (typeFilter === 'retell' && voice.standard_voice_type === 'retell') ||
        (typeFilter === 'preset' && voice.standard_voice_type === 'preset');

      return matchesProvider && matchesSearch && matchesGender && matchesAccent && matchesType;
    })
    .sort((a, b) => a.voice_name.localeCompare(b.voice_name));

  const getVoiceInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-purple-400 to-purple-600',
      'from-blue-400 to-blue-600',
      'from-pink-400 to-pink-600',
      'from-green-400 to-green-600',
      'from-orange-400 to-orange-600'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[85vh] max-w-6xl flex-col overflow-hidden p-0"
        style={{ minWidth: '1200px', minHeight: '700px' }}
      >
        <DialogHeader className="px-6 pb-0 pt-6">
          <DialogTitle className="text-xl">Seleccionar Voz</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as any)}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="px-6">
            <TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="elevenlabs"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Elevenlabs
              </TabsTrigger>
              <TabsTrigger
                value="openai"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                OpenAI
              </TabsTrigger>
              <TabsTrigger
                value="cartesia"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Cartesia
              </TabsTrigger>
              <TabsTrigger
                value="playht"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                PlayHT
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex items-center gap-3 border-b bg-muted/30 px-6 py-4">
            <Button
              variant="default"
              size="sm"
              className="shrink-0 bg-foreground text-background hover:bg-foreground/90"
              onClick={() => setIsAddCustomVoiceOpen(true)}
            >
              + Agregar voz personalizada
            </Button>

            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="w-[140px] bg-background">
                <SelectValue placeholder="Todos los Géneros" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Géneros</SelectItem>
                <SelectItem value="male">Masculino</SelectItem>
                <SelectItem value="female">Femenino</SelectItem>
              </SelectContent>
            </Select>

            <Select value={accentFilter} onValueChange={setAccentFilter}>
              <SelectTrigger className="w-[140px] bg-background">
                <SelectValue placeholder="Todos los Acentos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Acentos</SelectItem>
                <SelectItem value="American">Americano</SelectItem>
                <SelectItem value="British">Británico</SelectItem>
                <SelectItem value="Indian">Indio</SelectItem>
                <SelectItem value="Spanish">Español</SelectItem>
                <SelectItem value="German">Alemán</SelectItem>
                <SelectItem value="French">Francés</SelectItem>
                <SelectItem value="Mexican">Mexicano</SelectItem>
                <SelectItem value="Australian">Australiano</SelectItem>
                <SelectItem value="Southern American">Sureño Americano</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px] bg-background">
                <SelectValue placeholder="Todos los Tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Tipos</SelectItem>
                <SelectItem value="retell">Preajustes</SelectItem>
                <SelectItem value="preset">Preajustes del Proveedor</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="min-w-[200px] flex-1 bg-background"
            />
          </div>

          <TabsContent value={activeTab} className="mt-0 flex-1 overflow-y-auto px-6">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="text-muted-foreground">Cargando voces...</div>
              </div>
            ) : (
              <div>
                <table className="w-full">
                  <thead className="sticky top-0 border-b bg-background">
                    <tr className="text-sm font-medium text-muted-foreground">
                      <th className="w-[60px] py-3 text-left"></th>
                      <th className="py-3 text-left">Voz</th>
                      <th className="w-[300px] py-3 text-left">Características</th>
                      <th className="py-3 text-left">ID de Voz</th>
                      <th className="w-[120px] py-3 text-left"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVoices.map((voice) => (
                      <tr
                        key={voice.voice_id}
                        className="group cursor-pointer border-b border-border/40 transition-colors hover:bg-muted/50"
                        onClick={() => handleSelectVoice(voice.voice_id)}
                      >
                        <td className="py-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayVoice(voice);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            {playingVoiceId === voice.voice_id ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="6" y="4" width="4" height="16" rx="1" />
                                <rect x="14" y="4" width="4" height="16" rx="1" />
                              </svg>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            )}
                          </button>
                        </td>

                        <td className="py-4">
                          <div className="flex min-w-0 items-center gap-3">
                            {voice.avatar_url ? (
                              <img
                                src={voice.avatar_url}
                                alt={voice.voice_name}
                                className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div
                              className={`h-10 w-10 rounded-full bg-gradient-to-br ${getAvatarColor(
                                voice.voice_name
                              )} flex flex-shrink-0 items-center justify-center text-sm font-semibold text-white shadow-sm ${
                                voice.avatar_url ? 'hidden' : ''
                              }`}
                            >
                              {getVoiceInitials(voice.voice_name)}
                            </div>
                            <span className="truncate text-sm font-medium text-foreground">{voice.voice_name}</span>
                          </div>
                        </td>

                        <td className="py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            {voice.accent && (
                              <span className="whitespace-nowrap rounded-md border border-border/50 bg-muted px-2.5 py-1 text-xs text-foreground">
                                {voice.accent}
                              </span>
                            )}
                            {voice.age && (
                              <span className="whitespace-nowrap rounded-md border border-border/50 bg-muted px-2.5 py-1 text-xs text-foreground">
                                {voice.age}
                              </span>
                            )}
                            {voice.standard_voice_type && (
                              <span className="whitespace-nowrap rounded-md border border-border/50 bg-muted px-2.5 py-1 text-xs capitalize text-foreground">
                                {voice.standard_voice_type}
                              </span>
                            )}
                            {voice.voice_type === 'custom' && (
                              <span className="whitespace-nowrap rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs text-primary">
                                Personalizado
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-4">
                          <div className="truncate font-mono text-sm text-muted-foreground">{voice.voice_id}</div>
                        </td>

                        <td className="py-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectVoice(voice.voice_id);
                            }}
                            className="flex items-center gap-1.5 whitespace-nowrap rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground opacity-0 shadow-sm transition-opacity duration-200 hover:bg-muted group-hover:opacity-100"
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20,6 9,17 4,12" />
                            </svg>
                            Usar Voz
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredVoices.length === 0 && !loading && (
                  <div className="flex h-64 items-center justify-center text-muted-foreground">
                    No se encontraron voces
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>

      <Dialog open={isAddCustomVoiceOpen} onOpenChange={setIsAddCustomVoiceOpen}>
        <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl">Agregar Voz Personalizada</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="community" className="flex w-full flex-1 flex-col overflow-hidden">
            <TabsList className="w-full">
              <TabsTrigger value="community" className="flex-1">
                Voces de la Comunidad
              </TabsTrigger>
            </TabsList>

            <TabsContent value="community" className="flex flex-1 flex-col space-y-4 overflow-hidden">
              {!selectedCommunityVoice ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Buscar Voces de la Comunidad</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Buscar por nombre de voz"
                        value={communitySearchQuery}
                        onChange={(e) => setCommunitySearchQuery(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSearchCommunityVoices();
                          }
                        }}
                      />
                      <Button onClick={handleSearchCommunityVoices} disabled={loadingCommunityVoices}>
                        Buscar
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto rounded-lg border">
                    {loadingCommunityVoices ? (
                      <div className="flex h-64 items-center justify-center">
                        <div className="text-muted-foreground">Buscando voces...</div>
                      </div>
                    ) : communityVoices.length > 0 ? (
                      <div className="divide-y">
                        {communityVoices.map((voice) => (
                          <div key={voice.voice_id} className="p-4 transition-colors hover:bg-muted/50">
                            <div className="flex items-start gap-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlayCommunityVoice(voice);
                                }}
                                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted-foreground hover:text-background"
                              >
                                {playingVoiceId === voice.voice_id ? (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <rect x="6" y="4" width="4" height="16" rx="1" />
                                    <rect x="14" y="4" width="4" height="16" rx="1" />
                                  </svg>
                                ) : (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                )}
                              </button>

                              <div className="min-w-0 flex-1">
                                <h4 className="mb-1 text-sm font-medium">{voice.name}</h4>
                                <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">{voice.description}</p>
                                <div className="flex flex-wrap gap-2">
                                  {voice.accent && (
                                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs">
                                      {voice.accent}
                                    </span>
                                  )}
                                  {voice.gender && (
                                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs">
                                      {voice.gender}
                                    </span>
                                  )}
                                  {voice.age && (
                                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs">
                                      {voice.age}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <Button size="sm" onClick={() => handleSelectCommunityVoice(voice)}>
                                Seleccionar
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : communitySearchQuery ? (
                      <div className="flex h-64 items-center justify-center text-muted-foreground">
                        No se encontraron voces
                      </div>
                    ) : (
                      <div className="flex h-64 items-center justify-center text-muted-foreground">
                        Ingresa un término de búsqueda para encontrar voces de la comunidad
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nombre de Voz</label>
                    <p className="text-sm text-muted-foreground">
                      Explora las voces de la comunidad <span className="cursor-pointer text-primary">aquí</span>.
                    </p>
                    <Input
                      value={editableVoiceName}
                      onChange={(e) => setEditableVoiceName(e.target.value)}
                      placeholder="Nombre de la voz"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCommunityVoice(null);
                      setEditableVoiceName('');
                    }}
                  >
                    ← Volver a búsqueda
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => setIsAddCustomVoiceOpen(false)}>
              Cancelar
            </Button>
            {selectedCommunityVoice && (
              <Button onClick={handleSaveCommunityVoice} disabled={loadingCommunityVoices}>
                Guardar
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
