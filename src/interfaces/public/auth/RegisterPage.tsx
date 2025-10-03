import React from 'react';

const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg">
      <div className="card max-w-md w-full mx-4">
        <h1 className="text-2xl font-bold text-center mb-6">Apply for Partnership</h1>
        <form className="space-y-4">
          <div>
            <label className="form-label">Email</label>
            <input type="email" className="form-input w-full" placeholder="your@email.com" />
          </div>
          <div>
            <label className="form-label">Password</label>
            <input type="password" className="form-input w-full" placeholder="••••••••" />
          </div>
          <div>
            <label className="form-label">Display Name</label>
            <input type="text" className="form-input w-full" placeholder="John Smith" />
          </div>
          <div>
            <label className="form-label">Role</label>
            <select className="form-input w-full">
              <option value="regional_partner">Regional Partner</option>
              <option value="neighborhood_agent">Neighborhood Agent</option>
            </select>
          </div>
          <button type="submit" className="btn-primary w-full">
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
