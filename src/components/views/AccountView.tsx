import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Lock } from 'lucide-react';
import { showToast } from '@/lib/toast';
import { authManager } from '@/lib/auth';
import { getInitials } from '@/lib/utils/formatters';

export function AccountView() {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [userInfo, setUserInfo] = useState({
    name: authManager.getUser()?.name || 'Admin',
    email: authManager.getUser()?.email || 'admin@sridevi.com',
    phone: authManager.getUser()?.phone || '+91 98765 43210',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await authManager.updateProfile({
        name: userInfo.name,
        phone: userInfo.phone
      });
      showToast('Profile updated successfully', 'success');
      setIsEditing(false);
    } catch (error) {
      showToast('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    // Validation checks
    if (!passwordData.currentPassword) {
      showToast('Please enter your current password', 'error');
      return;
    }

    if (!passwordData.newPassword) {
      showToast('Please enter a new password', 'error');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showToast('Password must be at least 8 characters long', 'error');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      showToast('New password must be different from current password', 'error');
      return;
    }
    
    setLoading(true);
    try {
      await authManager.changePassword(passwordData.currentPassword, passwordData.newPassword);
      showToast('Password changed successfully', 'success');
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      showToast(error.message || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-3 mb-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/avatars/admin.jpg" alt={userInfo.name} />
                <AvatarFallback className="text-xl">
                  {getInitials(userInfo.name)}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-lg">{userInfo.name}</h3>
            </div>

            <div className="space-y-3">
              <div>
                <Label>Full Name</Label>
                {isEditing ? (
                  <Input
                    value={userInfo.name}
                    onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                  />
                ) : (
                  <Input value={userInfo.name} readOnly className="bg-muted" />
                )}
              </div>

              <div>
                <Label>Email Address</Label>
                <Input value={userInfo.email} readOnly className="bg-muted" />
                {isEditing && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Email address cannot be changed for security reasons
                  </p>
                )}
              </div>



              <div>
                <Label>Phone Number</Label>
                {isEditing ? (
                  <Input
                    value={userInfo.phone}
                    onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                  />
                ) : (
                  <Input value={userInfo.phone} readOnly className="bg-muted" />
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="flex gap-2">
                <Button onClick={handleSaveProfile} disabled={loading} className="flex-1">
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="w-full">
                Edit Profile
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isChangingPassword ? (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Password</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Last changed 30 days ago
                </p>
                <Button 
                  onClick={() => setIsChangingPassword(true)}
                  variant="outline"
                  size="sm"
                >
                  Change Password
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  />
                </div>

                <div>
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Enter new password"
                  />
                  {passwordData.newPassword && (
                    <div className="mt-3 space-y-2">
                      <div className="flex gap-1">
                        {(() => {
                          const checks = [
                            passwordData.newPassword.length >= 8,
                            /[A-Z]/.test(passwordData.newPassword),
                            /[a-z]/.test(passwordData.newPassword),
                            /\d/.test(passwordData.newPassword),
                            /[@$!%*?&]/.test(passwordData.newPassword)
                          ];
                          const score = checks.filter(Boolean).length;
                          const getColor = (index: number) => {
                            if (index >= score) return 'bg-gray-200';
                            if (score <= 2) return 'bg-red-500';
                            if (score <= 3) return 'bg-orange-500';
                            return 'bg-green-500';
                          };
                          
                          return Array.from({ length: 5 }, (_, index) => (
                            <div
                              key={index}
                              className={`h-2 flex-1 rounded ${getColor(index)}`}
                            />
                          ));
                        })()
                        }
                      </div>
                      <div className="space-y-1 text-xs">
                        {[
                          { test: passwordData.newPassword.length >= 8, text: 'At least 8 characters' },
                          { test: /[A-Z]/.test(passwordData.newPassword), text: 'One uppercase letter' },
                          { test: /[a-z]/.test(passwordData.newPassword), text: 'One lowercase letter' },
                          { test: /\d/.test(passwordData.newPassword), text: 'One number' },
                          { test: /[@$!%*?&]/.test(passwordData.newPassword), text: 'One special character (@$!%*?&)' }
                        ].map((requirement, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              requirement.test ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                            <span className={requirement.test ? 'text-green-700' : 'text-gray-500'}>
                              {requirement.text}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-gray-600 mt-2">
                        Password strength: {(() => {
                          const score = [
                            passwordData.newPassword.length >= 8,
                            /[A-Z]/.test(passwordData.newPassword),
                            /[a-z]/.test(passwordData.newPassword),
                            /\d/.test(passwordData.newPassword),
                            /[@$!%*?&]/.test(passwordData.newPassword)
                          ].filter(Boolean).length;
                          
                          if (score <= 2) return <span className="text-red-600 font-medium">Weak</span>;
                          if (score <= 3) return <span className="text-orange-600 font-medium">Fair</span>;
                          if (score <= 4) return <span className="text-green-600 font-medium">Good</span>;
                          return <span className="text-green-700 font-medium">Strong</span>;
                        })()} ({[
                          passwordData.newPassword.length >= 8,
                          /[A-Z]/.test(passwordData.newPassword),
                          /[a-z]/.test(passwordData.newPassword),
                          /\d/.test(passwordData.newPassword),
                          /[@$!%*?&]/.test(passwordData.newPassword)
                        ].filter(Boolean).length}/5)
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleChangePassword} disabled={loading} className="flex-1">
                    {loading ? 'Changing...' : 'Change Password'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}