import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Music, User, Check, X, Search, Play, ExternalLink, Trash2, Globe } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PublicSong {
  id: string;
  user_id: string;
  title: string;
  file_url: string;
  file_name: string;
  file_size: number | null;
  created_at: string;
  is_public: boolean;
}

interface PendingTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  audio_url: string;
  artwork_url?: string;
  created_at: string;
  uploaded_by?: string;
}

interface PendingArtist {
  id: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  created_by?: string;
}

export default function MusicModeration() {
  const [pendingTracks, setPendingTracks] = useState<PendingTrack[]>([]);
  const [pendingArtists, setPendingArtists] = useState<PendingArtist[]>([]);
  const [approvedTracks, setApprovedTracks] = useState<PendingTrack[]>([]);
  const [approvedArtists, setApprovedArtists] = useState<PendingArtist[]>([]);
  const [publicSongs, setPublicSongs] = useState<PublicSong[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch pending tracks
      const { data: pendingTracksData } = await supabase
        .from("tracks")
        .select("*")
        .eq("is_approved", false)
        .order("created_at", { ascending: false });
      setPendingTracks(pendingTracksData || []);

      // Fetch approved tracks
      const { data: approvedTracksData } = await supabase
        .from("tracks")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(50);
      setApprovedTracks(approvedTracksData || []);

      // Fetch pending artists (not verified)
      const { data: pendingArtistsData } = await supabase
        .from("artists")
        .select("*")
        .eq("is_verified", false)
        .order("created_at", { ascending: false });
      setPendingArtists(pendingArtistsData || []);

      // Fetch verified artists
      const { data: approvedArtistsData } = await supabase
        .from("artists")
        .select("*")
        .eq("is_verified", true)
        .order("created_at", { ascending: false })
        .limit(50);
      setApprovedArtists(approvedArtistsData || []);

      // Fetch public listed songs (only admins can delete these)
      const { data: publicSongsData } = await supabase
        .from("listed_songs")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false });
      setPublicSongs(publicSongsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const deletePublicSong = async (song: PublicSong) => {
    try {
      // Delete from storage
      const fileName = song.file_url.split('/').slice(-2).join('/');
      await supabase.storage.from('listed-songs').remove([fileName]);

      // Delete from database
      const { error } = await supabase
        .from("listed_songs")
        .delete()
        .eq("id", song.id);

      if (error) throw error;
      toast.success("Public song deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting public song:", error);
      toast.error("Failed to delete public song");
    }
  };

  const approveTrack = async (trackId: string) => {
    try {
      const { error } = await supabase
        .from("tracks")
        .update({ is_approved: true })
        .eq("id", trackId);

      if (error) throw error;
      toast.success("Track approved");
      fetchData();
    } catch (error) {
      toast.error("Failed to approve track");
    }
  };

  const rejectTrack = async (trackId: string) => {
    try {
      const { error } = await supabase.from("tracks").delete().eq("id", trackId);
      if (error) throw error;
      toast.success("Track rejected and deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to reject track");
    }
  };

  const approveArtist = async (artistId: string) => {
    try {
      const { error } = await supabase
        .from("artists")
        .update({ is_verified: true })
        .eq("id", artistId);

      if (error) throw error;
      toast.success("Artist verified");
      fetchData();
    } catch (error) {
      toast.error("Failed to verify artist");
    }
  };

  const rejectArtist = async (artistId: string) => {
    try {
      const { error } = await supabase.from("artists").delete().eq("id", artistId);
      if (error) throw error;
      toast.success("Artist rejected and deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to reject artist");
    }
  };

  const deleteTrack = async (trackId: string) => {
    try {
      const { error } = await supabase.from("tracks").delete().eq("id", trackId);
      if (error) throw error;
      toast.success("Track deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete track");
    }
  };

  const deleteArtist = async (artistId: string) => {
    try {
      const { error } = await supabase.from("artists").delete().eq("id", artistId);
      if (error) throw error;
      toast.success("Artist deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete artist");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Music Moderation</h1>
          <p className="text-muted-foreground">
            Review and approve uploaded tracks and artists
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">
            {pendingTracks.length} Pending Tracks
          </Badge>
          <Badge variant="outline">
            {pendingArtists.length} Pending Artists
          </Badge>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tracks or artists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="pending-tracks">
        <TabsList>
          <TabsTrigger value="pending-tracks">
            Pending Tracks
            {pendingTracks.length > 0 && (
              <Badge variant="destructive" className="ml-2">{pendingTracks.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending-artists">
            Pending Artists
            {pendingArtists.length > 0 && (
              <Badge variant="destructive" className="ml-2">{pendingArtists.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="public-songs">
            Public Songs
            <Badge variant="outline" className="ml-2">{publicSongs.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="approved-tracks">Approved Tracks</TabsTrigger>
          <TabsTrigger value="approved-artists">Verified Artists</TabsTrigger>
        </TabsList>

        <TabsContent value="public-songs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Public Listed Songs (Admin Delete Only)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {publicSongs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No public songs
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>File</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {publicSongs.map((song) => (
                      <TableRow key={song.id}>
                        <TableCell className="font-medium">{song.title}</TableCell>
                        <TableCell className="text-muted-foreground">{song.file_name}</TableCell>
                        <TableCell>{song.file_size ? `${(song.file_size / 1024 / 1024).toFixed(1)} MB` : '-'}</TableCell>
                        <TableCell>{new Date(song.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Public Song</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{song.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deletePublicSong(song)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending-tracks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Pending Track Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingTracks.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No pending tracks to review
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Track</TableHead>
                      <TableHead>Artist</TableHead>
                      <TableHead>Album</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Preview</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingTracks.map((track) => (
                      <TableRow key={track.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={track.artwork_url || "/placeholder.svg"}
                              alt={track.title}
                              className="h-10 w-10 rounded object-cover"
                            />
                            <span className="font-medium">{track.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>{track.artist}</TableCell>
                        <TableCell>{track.album || "-"}</TableCell>
                        <TableCell>{formatDate(track.created_at)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(track.audio_url, "_blank")}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Play
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => approveTrack(track.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectTrack(track.id)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending-artists">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Pending Artist Verifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingArtists.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No pending artists to review
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Artist</TableHead>
                      <TableHead>Bio</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingArtists.map((artist) => (
                      <TableRow key={artist.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={artist.avatar_url || "/placeholder.svg"}
                              alt={artist.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                            <span className="font-medium">{artist.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {artist.bio || "-"}
                        </TableCell>
                        <TableCell>{formatDate(artist.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => approveArtist(artist.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Verify
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectArtist(artist.id)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved-tracks">
          <Card>
            <CardHeader>
              <CardTitle>Approved Tracks</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Track</TableHead>
                    <TableHead>Artist</TableHead>
                    <TableHead>Album</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedTracks.map((track) => (
                    <TableRow key={track.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={track.artwork_url || "/placeholder.svg"}
                            alt={track.title}
                            className="h-10 w-10 rounded object-cover"
                          />
                          <span className="font-medium">{track.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{track.artist}</TableCell>
                      <TableCell>{track.album || "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/niranx/music/track/${track.id}`)}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Track</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{track.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteTrack(track.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved-artists">
          <Card>
            <CardHeader>
              <CardTitle>Verified Artists</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Artist</TableHead>
                    <TableHead>Bio</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedArtists.map((artist) => (
                    <TableRow key={artist.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={artist.avatar_url || "/placeholder.svg"}
                            alt={artist.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                          <span className="font-medium">{artist.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {artist.bio || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/niranx/music/artist/${artist.id}`)}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Artist</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{artist.name}"? This will also remove their association with any tracks. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteArtist(artist.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}