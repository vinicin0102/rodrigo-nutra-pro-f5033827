import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Camera, Save, Trophy, Medal, Award, Flame, Edit2, X, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProfileData {
  username: string;
  avatar_url: string | null;
  bio: string | null;
  points: number;
  total_sales: number;
}

interface UserAward {
  id: string;
  award_name: string;
  award_description: string | null;
  award_category: string | null;
  award_icon: string | null;
  points_cost: number | null;
  earned_at: string;
}

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [awards, setAwards] = useState<UserAward[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchAwards();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;

      setProfile({
        username: data.username,
        avatar_url: data.avatar_url,
        bio: data.bio || null,
        points: data.points || 0,
        total_sales: data.total_sales || 0,
      });
      setBioText(data.bio || "");
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast.error("Erro ao carregar perfil");
    } finally {
      setLoading(false);
    }
  };

  const fetchAwards = async () => {
    try {
      const { data, error } = await supabase
        .from("user_awards")
        .select("*")
        .eq("user_id", user?.id)
        .order("earned_at", { ascending: false });

      if (error) throw error;
      setAwards(data || []);
    } catch (error: any) {
      console.error("Error fetching awards:", error);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("O tamanho máximo é 5MB");
      return;
    }

    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `avatars/${user.id}/${Date.now()}.${fileExt}`;

      // Upload to storage - use profile-avatars bucket if available, fallback to community-media
      const bucketName = "community-media"; // Can be changed to "profile-avatars" after migration
      const { error: uploadError, data } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucketName).getPublicUrl(data.path);

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : null));
      toast.success("Foto de perfil atualizada com sucesso!");
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast.error("Erro ao fazer upload da foto");
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSaveBio = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ bio: bioText })
        .eq("id", user.id);

      if (error) throw error;

      setProfile((prev) => (prev ? { ...prev, bio: bioText } : null));
      setEditingBio(false);
      toast.success("Bio atualizada com sucesso!");
    } catch (error: any) {
      console.error("Error saving bio:", error);
      toast.error("Erro ao salvar bio");
    } finally {
      setSaving(false);
    }
  };

  const getLevel = (points: number) => {
    if (points >= 2000) return { name: "Diamante", color: "gradient-elite", icon: Trophy };
    if (points >= 1500) return { name: "Platina", color: "bg-gradient-to-r from-slate-300 to-slate-400", icon: Medal };
    if (points >= 1000) return { name: "Ouro", color: "bg-gradient-to-r from-yellow-400 to-yellow-600", icon: Award };
    if (points >= 500) return { name: "Prata", color: "bg-gradient-to-r from-gray-300 to-gray-400", icon: Medal };
    return { name: "Bronze", color: "bg-gradient-to-r from-amber-600 to-amber-700", icon: Award };
  };

  const getNextLevelPoints = (points: number) => {
    if (points < 500) return 500;
    if (points < 1000) return 1000;
    if (points < 1500) return 1500;
    if (points < 2000) return 2000;
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-8 md:pt-24">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-center">
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-8 md:pt-24">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-center">
          <p className="text-muted-foreground">Erro ao carregar perfil</p>
        </div>
      </div>
    );
  }

  const level = getLevel(profile.points);
  const nextLevelPoints = getNextLevelPoints(profile.points);
  const progress = nextLevelPoints ? (profile.points / nextLevelPoints) * 100 : 100;
  const LevelIcon = level.icon;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 md:pt-24">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">Meu Perfil</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações e veja suas conquistas
          </p>
        </div>

        {/* Profile Card */}
        <Card className="border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center md:items-start space-y-4">
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-primary/20">
                    {profile.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} alt={profile.username} />
                    ) : null}
                    <AvatarFallback className="gradient-fire text-white text-3xl">
                      {profile.username
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 rounded-full w-10 h-10"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold">{profile.username}</h2>
                  <Badge className={`mt-2 ${level.color}`}>
                    <LevelIcon className="w-3 h-3 mr-1" />
                    {level.name}
                  </Badge>
                </div>
              </div>

              {/* Stats Section */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-gradient-to-br from-primary/10 to-transparent">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-primary" />
                        <span className="text-sm text-muted-foreground">Pontuação</span>
                      </div>
                      <p className="text-2xl font-bold mt-2 text-gradient-fire">
                        {profile.points}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-accent/10 to-transparent">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-accent" />
                        <span className="text-sm text-muted-foreground">Faturamento</span>
                      </div>
                      <p className="text-2xl font-bold mt-2">
                        R$ {profile.total_sales.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {nextLevelPoints && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Próximo nível: {level.name}
                      </span>
                      <span className="font-semibold">
                        {nextLevelPoints - profile.points} pts restantes
                      </span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>
                )}

                {!nextLevelPoints && (
                  <div className="text-center py-2">
                    <Badge className="gradient-elite">
                      <Trophy className="w-3 h-3 mr-1" />
                      Nível Máximo Atingido!
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Sobre Mim</span>
              {!editingBio ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingBio(true)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingBio(false);
                      setBioText(profile.bio || "");
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveBio}
                    disabled={saving}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editingBio ? (
              <div className="space-y-4">
                <Textarea
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  placeholder="Conte um pouco sobre você..."
                  rows={4}
                  className="resize-none"
                  maxLength={500}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Máximo de 500 caracteres</span>
                  <span>{bioText.length}/500</span>
                </div>
                <Button onClick={handleSaveBio} disabled={saving} className="w-full">
                  {saving ? "Salvando..." : "Salvar Bio"}
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground whitespace-pre-wrap">
                {profile.bio || "Nenhuma biografia adicionada ainda. Clique em Editar para adicionar uma!"}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Awards Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent" />
              Premiações Recebidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {awards.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <Trophy className="w-16 h-16 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  Você ainda não recebeu nenhuma premiação
                </p>
                <p className="text-sm text-muted-foreground">
                  Continue participando e alcançando metas para ganhar prêmios!
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {awards.map((award) => (
                  <Card key={award.id} className="hover-lift">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg gradient-elite flex items-center justify-center flex-shrink-0">
                          <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <h3 className="font-semibold">{award.award_name}</h3>
                          {award.award_description && (
                            <p className="text-sm text-muted-foreground">
                              {award.award_description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {award.award_category && (
                              <Badge variant="secondary" className="text-xs">
                                {award.award_category}
                              </Badge>
                            )}
                            {award.points_cost && (
                              <Badge variant="outline" className="text-xs">
                                <Flame className="w-3 h-3 mr-1" />
                                {award.points_cost} pts
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Recebido em{" "}
                            {new Date(award.earned_at).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;

