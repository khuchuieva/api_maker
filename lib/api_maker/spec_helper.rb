module ApiMaker::SpecHelper
  def chrome_logs
    page.driver.browser.manage.logs.get(:browser)
  end

  def expect_no_chrome_errors
    logs = chrome_logs.map(&:to_s)
    logs = logs.reject { |log| log.include?("Warning: Can't perform a React state update on an unmounted component.") }
    return if !logs || !logs.join("\n").include?("SEVERE ")
    puts logs.join("\n")
    expect(logs).to eq nil
  end

  def expect_no_errors
    expect_no_flash_errors
    expect_no_chrome_errors
  end

  def js_fill_in(element_id, with:)
    page.execute_script("document.querySelector(#{element_id.to_json}).value = #{with.to_json}")
  end

  def pretty_html
    HtmlBeautifier.beautify(page.html)
  end

  def wait_for_chrome
    WaitUtil.wait_for_condition("wait for chrome", timeout_sec: 6, delay_sec: 0.5) do
      expect_no_chrome_errors
      yield
    end
  end

  def wait_for_flash_message(expected_message)
    received_messages = []

    begin
      WaitUtil.wait_for_condition("wait for flash message", timeout_sec: 10, delay_sec: 0.5) do
        current_message = flash_message_text
        received_messages << current_message
        current_message == expected_message
      end
    rescue WaitUtil::TimeoutError
      expect(received_messages.uniq.reject(&:blank?)).to eq include expected_message
    end
  end

  def wait_for_selector(selector)
    wait_for_chrome { page.has_selector?(selector) }
  end
end