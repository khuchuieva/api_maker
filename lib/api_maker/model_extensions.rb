module ApiMaker::ModelExtensions
  def self.included(base)
    base.extend(ClassMethods)
  end

  module ClassMethods
    def api_maker_broadcast_updates
      after_commit on: :update do |model|
        channel_name = "api_maker_updates_#{model.class.name}_#{model.id}"
        serializer = ApiMaker::Serializer.new(model: model)

        ActionCable.server.broadcast(
          channel_name,
          model: serializer,
          type: :update
        )
      end
    end
  end

  def api_maker_event(event_name, args = {})
    channel_name = "api_maker_events_#{self.class.name}_#{id}_#{event_name}"
    serializer = ApiMaker::Serializer.new(model: self)

    ActionCable.server.broadcast(
      channel_name,
      args: args,
      event_name: event_name,
      model: serializer,
      type: :event
    )
  end
end
