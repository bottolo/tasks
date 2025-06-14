FROM ruby:3.4

RUN apt-get update -qq && apt-get install -y \
    build-essential \
    libpq-dev \
    nodejs \
    npm \
    yarn \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY Gemfile Gemfile.lock ./

RUN bundle install

COPY package*.json yarn.lock* ./

RUN if [ -f "package.json" ]; then yarn install; fi

COPY . .

RUN RAILS_ENV=production bundle exec rails assets:precompile || true

EXPOSE 3000

CMD ["rails", "server", "-b", "0.0.0.0", "-p", "3000"]
