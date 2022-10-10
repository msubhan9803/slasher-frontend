# config valid for current version and patch releases of Capistrano
lock "~> 3.17.1"

#set :log_level, :debug

set :repo_url, "git@bitbucket.org:slasherapp/slasher-web-new.git"
set :application, "slasher"
set :deploy_to, "/var/www/#{fetch(:application)}_#{fetch(:stage)}"
ask :branch, `git rev-parse --abbrev-ref HEAD`.chomp

set :ssh_options, {
  #keys: %w(~/.ssh/id_rsa),
  forward_agent: true, # To make this work, make sure to run: ssh-add ~/.ssh/id_rsa
  auth_methods: %w(publickey)
}

# Default value for :linked_files is []
append :linked_files, '.env'

# Default value for linked_dirs is []
# append :linked_dirs, "log", "tmp/pids", "tmp/cache", "tmp/sockets", "tmp/webpacker", "public/system", "vendor", "storage"

# Default value for keep_releases is 5
set :keep_releases, 3

namespace :deploy do
  desc 'Build application'
  task :build_app do
    on roles(:app) do
      within release_path do
        execute :npm, 'ci'
        execute :npm, 'run build'
        # After build, we no longer need the dev dependencies, so we'll remove them
        execute :npm, 'prune --omit=dev'
      end
    end
  end

  before :publishing, :build_app
end
